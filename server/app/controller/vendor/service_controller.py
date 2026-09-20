"""
app/controller/vendor/service_controller.py

Business logic for vendor service CRUD.

Architecture (versioned schema):
  ┌─────────┐   1:N   ┌─────────────────┐
  │ Service │ ──────► │ ServiceVersion  │
  └─────────┘         └─────────────────┘
      │                      │
      │ current_draft_version_id  ├── ServiceVariant   (service_version_id)
      │ current_live_version_id   ├── ServiceMedia     (service_version_id)
      └──────────────────────     └── <type>Detail     (service_version_id)

Create flow:
  1. Insert Service
  2. Insert ServiceVersion v1
  3. Set current_draft_version_id
  4. Insert variants / media / type-detail

Update flow:

  A. Existing draft:
     - Mutate draft in place
     - Update type-specific detail
     - Replace variants
     - Remove unretained media
     - Add new media

  B. Only live version exists:
     - Create new draft version v+1
     - Copy live version's type-specific detail
     - Copy live variants
     - Copy live media
     - Apply submitted changes to the copied draft
     - Point current_draft_version_id to new draft

Cover image handling (create + update):
  - Every media row has its own `is_cover` flag. Up to MAX_COVER_IMAGES (5)
    covers per version are allowed; more than that returns a 400.
  - Create: `image_is_cover` carries one flag per uploaded image.
  - Update:
      * `existing_media`  -> retention list. Accepts either bare ids
        `[23, 24]` or objects `[{"id": 23, "is_cover": true}, {"id": 24,
        "is_cover": false}]`. Omit = keep all, "[]" = clear all.
        Objects set is_cover on each retained row; bare ids leave it as is.
      * `image_is_cover`  -> one flag per NEW uploaded image
      * live-version ids are translated to the cloned draft rows' ids
      * new rows are inserted as non-cover, then flags are applied
        (un-cover first, then cover) so the limit is never exceeded midway
      * the final cover count is checked against MAX_COVER_IMAGES
      * if no cover remains after the update, the first image is promoted

Delete flow:
  - Soft-delete only: sets service.deleted_at
"""

from __future__ import annotations
from app.db import db

import json
import logging
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect

from app.models.models import (
    Service,
    ServiceMedia,
    ServiceVariant,
    ServiceVersion,
    Vendor,
)
from app.repositories.vendor.service_repository import (
    get_all_vendor_services,
    get_service_with_relations,
)
from app.schemas.services import (
    ServiceCreate,
    ServiceCreateResponse,
    ServiceStatusEnum,
)
from app.utils.vendor.media_utils import _upload_media
from app.utils.vendor.service_helpers import (
    _add_type_specific,
    _build_service_response,
    _enforce_variants,
    _update_type_specific,
)
from app.utils.vendor.media_retention import (
    parse_existing_media_ids,
    parse_bool_flag,
    parse_json_list,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

TYPE_DETAIL_RELATIONSHIPS = (
    "venue_detail",
    "catering_detail",
    "dj_detail",
    "photography_detail",
    "event_management_detail",
    "makeup_artist_detail",
)

# A service version may have several cover images, up to this many.
# (The DB unique index idx_media_unique_cover must be dropped for this.)
MAX_COVER_IMAGES = 5


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _require_vendor(current_user: dict) -> None:
    if current_user.get("role") != "vendor":
        raise HTTPException(
            status_code=403,
            detail="Vendor role required",
        )


async def _resolve_vendor_id(
    db: AsyncSession,
    email: str,
) -> int:
    result = await db.execute(
        select(Vendor.id).where(
            Vendor.email == email,
            Vendor.deleted_at.is_(None),
        )
    )

    vendor_id = result.scalar_one_or_none()

    if not vendor_id:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found",
        )

    return vendor_id


async def _load_version_collections(
    db: AsyncSession,
    version: ServiceVersion,
) -> None:
    """
    Explicitly load media + variants.
    Required under AsyncSession – never rely on implicit lazy loads.
    """
    await db.refresh(
        version,
        attribute_names=["media", "variants"],
    )


async def _next_version_number(
    db: AsyncSession,
    service_id: int,
) -> int:
    result = await db.execute(
        select(func.max(ServiceVersion.version_number))
        .where(
            ServiceVersion.service_id == service_id
        )
    )

    max_version = result.scalar_one_or_none()

    return (max_version or 0) + 1


# ---------------------------------------------------------------------------
# Cover helpers
# ---------------------------------------------------------------------------

async def _apply_cover_flags(
    db: AsyncSession,
    version_id: int,
    flags: dict[int, bool],
) -> bool:
    """
    Set `is_cover` on specific media rows of `version_id`.

    Uses bulk UPDATE statements (not ORM attribute mutation) because the
    version's `media` collection may be stale after the bulk deletes done
    earlier in the update flow.

    Returns:
        True  -> every media id exists on this version and was updated
        False -> at least one id does not belong to this version
    """
    # False first, then True: swapping covers never exceeds the limit midway.
    for media_id, value in sorted(flags.items(), key=lambda kv: kv[1]):
        result = await db.execute(
            update(ServiceMedia)
            .where(
                ServiceMedia.service_version_id == version_id,
                ServiceMedia.id == media_id,
            )
            .values(is_cover=value)
            .execution_options(synchronize_session=False)
        )

        if not result.rowcount:
            return False

    return True


async def _count_covers(
    db: AsyncSession,
    version_id: int,
) -> int:
    await db.flush()

    total = await db.scalar(
        select(func.count())
        .select_from(ServiceMedia)
        .where(
            ServiceMedia.service_version_id == version_id,
            ServiceMedia.is_cover.is_(True),
        )
    )

    return int(total or 0)


async def _ensure_cover(
    db: AsyncSession,
    version_id: int,
) -> None:
    """
    Safety net: if the version has media but no cover (e.g. the previous
    cover was removed and no new one was chosen), promote the first image.
    """
    await db.flush()

    cover_count = await db.scalar(
        select(func.count())
        .select_from(ServiceMedia)
        .where(
            ServiceMedia.service_version_id == version_id,
            ServiceMedia.is_cover.is_(True),
        )
    )

    if cover_count:
        return

    first_image_id = await db.scalar(
        select(ServiceMedia.id)
        .where(
            ServiceMedia.service_version_id == version_id,
            ServiceMedia.media_type == "image",
        )
        .order_by(ServiceMedia.display_order, ServiceMedia.id)
        .limit(1)
    )

    if first_image_id is not None:
        await db.execute(
            update(ServiceMedia)
            .where(ServiceMedia.id == first_image_id)
            .values(is_cover=True)
            .execution_options(synchronize_session=False)
        )


# ---------------------------------------------------------------------------
# Existing-media parsing
# ---------------------------------------------------------------------------

def _to_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in ("true", "1", "yes")


def _parse_existing_media(
    raw: str | None,
) -> tuple[str, list[int], dict[int, bool]]:
    """
    Parse the `existing_media` form field.

    Accepted shapes:
      omitted / "" / "null"                       -> ("keep_all",  [],  {})
      "[]"                                        -> ("keep_none", [],  {})
      "[23, 24]"                                  -> ("keep_ids",  ids, {})
      '[{"id":23,"is_cover":true},{"id":24,"is_cover":false}]'
                                                  -> ("keep_ids",  ids,
                                                      {23: True, 24: False})

    Returns:
        (mode, keep_ids, cover_flags)
        cover_flags maps media id -> is_cover for every entry that carried an
        explicit `is_cover` value. Bare ids / missing flags are left out, so
        the stored cover value of that row is not touched.
    """

    if raw is None or not raw.strip():
        return "keep_all", [], {}

    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(
            status_code=400,
            detail={
                "field": "existing_media",
                "message": "existing_media must be valid JSON.",
            },
        )

    if parsed is None:
        return "keep_all", [], {}

    if not isinstance(parsed, list):
        raise HTTPException(
            status_code=400,
            detail={
                "field": "existing_media",
                "message": "existing_media must be a JSON list.",
            },
        )

    keep_ids: list[int] = []
    cover_flags: dict[int, bool] = {}

    for item in parsed:
        flag = None

        if isinstance(item, dict):
            raw_id = item.get("id")
            if item.get("is_cover") is not None:
                flag = _to_bool(item.get("is_cover"))
        else:
            raw_id = item

        try:
            media_id = int(raw_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "existing_media",
                    "message": (
                        "Each existing_media entry must be a media id "
                        "or an object with an integer 'id'."
                    ),
                },
            )

        keep_ids.append(media_id)

        if flag is not None:
            cover_flags[media_id] = flag

    if not keep_ids:
        return "keep_none", [], {}

    return "keep_ids", keep_ids, cover_flags


# ---------------------------------------------------------------------------
# Type-specific detail cloning
# ---------------------------------------------------------------------------

def _clone_type_specific_details(
    db: AsyncSession,
    source_version: ServiceVersion,
    target_version_id: int,
) -> bool:
    """
    Clone whichever type-specific detail exists on the source version.

    We intentionally use SQLAlchemy inspection instead of importing all six
    detail model classes here.

    Returns:
        True  -> a detail row was cloned
        False -> source version had no type-specific detail
    """

    for relationship_name in TYPE_DETAIL_RELATIONSHIPS:
        source_detail = getattr(
            source_version,
            relationship_name,
            None,
        )

        if source_detail is None:
            continue

        mapper = inspect(source_detail).mapper

        values = {}

        for column in mapper.columns:
            # Never copy the original PK.
            if column.primary_key:
                continue

            # The detail row belongs to the target version.
            if column.key == "service_version_id":
                continue

            values[column.key] = getattr(
                source_detail,
                column.key,
            )

        values["service_version_id"] = target_version_id

        detail_class = mapper.class_

        cloned_detail = detail_class(**values)

        db.add(cloned_detail)

        logger.debug(
            "Cloned type-specific detail: %s -> version=%s",
            relationship_name,
            target_version_id,
        )

        return True

    return False


async def _load_type_specific_details(
    db: AsyncSession,
    version: ServiceVersion,
) -> None:
    """
    Explicitly load all type-specific relationships.

    This is important because AsyncSession does not allow an implicit
    lazy-load from normal attribute access. Without this, code such as:

        if version.venue_detail:

    can raise MissingGreenlet.
    """

    await db.refresh(
        version,
        attribute_names=list(TYPE_DETAIL_RELATIONSHIPS),
    )


# ---------------------------------------------------------------------------
# Variant cloning
# ---------------------------------------------------------------------------

def _clone_variants(
    db: AsyncSession,
    source_version: ServiceVersion,
    target_version_id: int,
) -> int:
    """
    Clone all variants from source version to target version.

    Returns:
        Number of variants cloned.
    """

    count = 0

    for variant in source_version.variants:

        db.add(
            ServiceVariant(
                service_version_id=target_version_id,
                variant_name=variant.variant_name,
                description=variant.description,
                min_quantity=variant.min_quantity,
                max_quantity=variant.max_quantity,
                pricing_type=variant.pricing_type,
                currency=variant.currency,

                pricing=(
                    variant.pricing.copy()
                    if variant.pricing
                    else {}
                ),

                menu=(
                    variant.menu.copy()
                    if variant.menu
                    else []
                ),

                deliverables=(
                    variant.deliverables.copy()
                    if variant.deliverables
                    else []
                ),

                inclusions=(
                    variant.inclusions.copy()
                    if variant.inclusions
                    else []
                ),

                exclusions=(
                    variant.exclusions.copy()
                    if variant.exclusions
                    else []
                ),

                policies=(
                    variant.policies.copy()
                    if variant.policies
                    else {}
                ),

                metadata_=(
                    variant.metadata_.copy()
                    if variant.metadata_
                    else {}
                ),

                is_default=variant.is_default,
            )
        )

        count += 1

    return count


# ---------------------------------------------------------------------------
# Media cloning
# ---------------------------------------------------------------------------

def _clone_media(
    db: AsyncSession,
    source_version: ServiceVersion,
    target_version_id: int,
) -> dict[int, ServiceMedia]:
    """
    Clone media records from source version to target version.

    IMPORTANT:
    The cloned media records are new/pending SQLAlchemy objects. We do not
    attempt to delete them during the same request.

    Returns:
        Mapping of {source_media_id: cloned ServiceMedia}.
        Cloned rows only get their real `id` after the next `db.flush()`.
        The frontend still holds the SOURCE (live) ids, so this map is used
        to translate retained / cover ids onto the cloned rows.
        (len(mapping) == number of media records cloned)
    """

    id_map: dict[int, ServiceMedia] = {}

    for media in source_version.media:

        clone = ServiceMedia(
            service_version_id=target_version_id,
            media_url=media.media_url,
            media_type=media.media_type,
            is_cover=media.is_cover,
            display_order=media.display_order,
            metadata_=(
                media.metadata_.copy()
                if media.metadata_
                else {}
            ),
        )

        db.add(clone)

        id_map[media.id] = clone

    return id_map


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

async def create_service_controller(
    data: str,
    images: list,
    image_is_cover: list[bool],
    external_media: str,
    save_as_draft: str,
    db: AsyncSession,
    current_user: dict,
) -> ServiceCreateResponse:

    try:
        _require_vendor(current_user)
        vendor_id = await _resolve_vendor_id(db, current_user["email"])

        save_draft = parse_bool_flag(save_as_draft)
        raw = json.loads(data)

        logger.info(
            "create_service: images=%s image_is_cover=%s",
            [getattr(i, "filename", None) for i in images],
            image_is_cover,
        )

        # ── 1. Draft defaults BEFORE Pydantic ─────────────────────────
        if save_draft:
            name = (raw.get("service_name") or "").strip()
            if len(name) < 3:
                raw["service_name"] = "Untitled draft"

        # ── 2. Validate (now name is always ≥ 3 for drafts) ───────────
        from pydantic import ValidationError
        try:
            parsed = ServiceCreate(**raw)
        except ValidationError as e:
            raise HTTPException(status_code=400, detail=e.errors())

        service_status = (
            ServiceStatusEnum.draft if save_draft else ServiceStatusEnum.under_review
        )
        version_status = "draft" if save_draft else "under_review"

        # ── 3. service_type guard ─────────────────────────────────────
        VALID_SERVICE_TYPES = {
            "venue",
            "catering",
            "dj",
            "photography",
            "makeup_artist",
            "event_management",
        }
        service_type = (parsed.service_type or "").strip()
        if not service_type or service_type not in VALID_SERVICE_TYPES:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "service_type",
                    "message": (
                        "service_type is required and must be one of: "
                        + ", ".join(sorted(VALID_SERVICE_TYPES))
                    ),
                },
            )

        # 1. Service row
        db_service = Service(
            vendor_id=vendor_id,
            service_type=service_type,
            status=service_status,
            is_active=False,
        )
        db.add(db_service)
        await db.flush()

        # 2. ServiceVersion v1
        version = ServiceVersion(
            service_id=db_service.id,
            version_number=1,
            status=version_status,
            service_name=parsed.service_name,  # already defaulted if draft
            description=parsed.description,
            add_line1=parsed.add_line1,
            add_line2=parsed.add_line2,
            area=parsed.area,
            city=parsed.city,
            state=parsed.state,
            country=parsed.country or "India",
            pincode=parsed.pincode,
            latitude=parsed.latitude,
            longitude=parsed.longitude,
            metadata_=(
                parsed.metadata_.model_dump() if parsed.metadata_ else {}
            ),
            submitted_at=None if save_draft else _utcnow(),
        )
        db.add(version)
        await db.flush()

        # 3. Point service to draft version
        db_service.current_draft_version_id = version.id
        await db.flush()

        # 4. Type-specific detail
        _add_type_specific(db, version.id, parsed)

        # 5. Variants
        parsed.variants = _enforce_variants(parsed.variants)
        for variant in parsed.variants:
            db.add(
                ServiceVariant(
                    service_version_id=version.id,
                    variant_name=variant.variant_name,
                    description=variant.description,
                    min_quantity=variant.min_quantity,
                    max_quantity=variant.max_quantity,
                    pricing_type=variant.pricing_type,
                    currency=variant.currency,
                    pricing=variant.pricing or {},
                    menu=variant.menu or [],
                    deliverables=variant.deliverables or [],
                    inclusions=variant.inclusions or [],
                    exclusions=variant.exclusions or [],
                    policies=variant.policies or {},
                    metadata_=variant.metadata_ or {},
                    is_default=variant.is_default,
                )
            )

        if len(images) != len(image_is_cover):
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "images",
                    "message": (
                        "Each uploaded image must have "
                        "a corresponding cover flag."
                    ),
                },
            )

        if len(images) > 5:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "images",
                    "message": "Maximum 5 images allowed.",
                },
            )

        cover_count = sum(
            1 for value in image_is_cover
            if value is True
        )

        if images and cover_count == 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "images",
                    "message": (
                        "At least one image must be "
                        "selected as a cover image."
                    ),
                },
            )

        if cover_count > MAX_COVER_IMAGES:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "images",
                    "message": (
                        f"Maximum {MAX_COVER_IMAGES} cover images allowed."
                    ),
                },
            )

        # 6. Media
        display_order = 0

        for img, is_cover in zip(
            images,
            image_is_cover,
        ):
            url = await _upload_media(img)

            db.add(
                ServiceMedia(
                    service_version_id=version.id,
                    media_url=url,
                    media_type="image",
                    is_cover=bool(is_cover),
                    display_order=display_order,
                    metadata_={},
                )
            )

            display_order += 1

        for item in parse_json_list(external_media):
            db.add(
                ServiceMedia(
                    service_version_id=version.id,
                    media_url=item["media_url"],
                    media_type=item.get("media_type", "image"),
                    is_cover=False,
                    display_order=display_order,
                    metadata_=item.get("metadata", {}),
                )
            )
            display_order += 1

        await db.commit()

        logger.info(
            "Service created: id=%s version=%s vendor=%s draft=%s",
            db_service.id,
            version.id,
            vendor_id,
            save_draft,
        )

        return ServiceCreateResponse(
            message=(
                "Draft saved successfully"
                if save_draft
                else "Service created successfully"
            ),
            service_id=db_service.id,
        )

    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.exception("create_service_controller failed")
        raise HTTPException(status_code=500, detail="Failed to create service")


# ---------------------------------------------------------------------------
# READ - ALL
# ---------------------------------------------------------------------------

async def get_all_services_controller(
    db: AsyncSession,
    current_user: dict,
) -> list:

    _require_vendor(current_user)

    services = await get_all_vendor_services(
        db,
        current_user,
    )

    return [
        _build_service_response(service)
        for service in services
    ]


# ---------------------------------------------------------------------------
# READ - SINGLE
# ---------------------------------------------------------------------------

async def get_service_controller(
    service_id: int,
    db: AsyncSession,
    current_user: dict,
):

    _require_vendor(current_user)

    db_service = await get_service_with_relations(
        service_id,
        db,
        current_user,
    )

    if not db_service:

        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    return _build_service_response(
        db_service
    )


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

async def update_service_controller(
    service_id: int,
    data: str,
    existing_media: str | None,   # can be None now
    images: list,
    videos: list,
    external_media: str,
    save_as_draft: str,           # NEW
    db: AsyncSession,
    current_user: dict,
    image_is_cover: list[bool] | None = None,   # NEW: one flag per new image
):
    try:
        _require_vendor(current_user)

        db_service = await get_service_with_relations(
            service_id, db, current_user,
        )
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        parsed = ServiceCreate(**json.loads(data))
        save_draft = parse_bool_flag(save_as_draft)

        # ── Cover flags validation (before any DB work / uploads) ─────
        cover_flags = list(image_is_cover) if image_is_cover else [False] * len(images)

        logger.info(
            "update_service: service=%s images=%s image_is_cover=%s existing_media=%s",
            service_id,
            [getattr(i, "filename", None) for i in images],
            cover_flags,
            existing_media,
        )

        if len(cover_flags) != len(images):
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "image_is_cover",
                    "message": (
                        "Each uploaded image must have "
                        "a corresponding cover flag."
                    ),
                },
            )

        # existing_media may be bare ids OR [{"id":..,"is_cover":..}]
        media_mode, keep_ids, existing_cover_flags = _parse_existing_media(
            existing_media
        )

        if sum(1 for value in cover_flags if value is True) > MAX_COVER_IMAGES:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "image_is_cover",
                    "message": (
                        f"Maximum {MAX_COVER_IMAGES} cover images allowed."
                    ),
                },
            )

        draft = db_service.current_draft_version
        is_new_draft = draft is None

        # {live_media_id: cloned ServiceMedia} — only filled for CASE 2
        media_id_map: dict[int, ServiceMedia] = {}

        # ==============================================================
        # CASE 1: Existing draft
        # ==============================================================
        if not is_new_draft:
            logger.info(
                "Updating existing draft: service=%s draft_version=%s status=%s",
                db_service.id, draft.id, draft.status,
            )
            await _load_version_collections(db, draft)

            # Base fields
            draft.service_name = parsed.service_name
            draft.description = parsed.description
            draft.add_line1 = parsed.add_line1
            draft.add_line2 = parsed.add_line2
            draft.area = parsed.area
            draft.city = parsed.city
            draft.state = parsed.state
            draft.country = parsed.country or "India"
            draft.pincode = parsed.pincode
            draft.latitude = parsed.latitude
            draft.longitude = parsed.longitude
            draft.metadata_ = (
                parsed.metadata_.model_dump() if parsed.metadata_ else {}
            )

            _update_type_specific(db, draft, parsed)

        # ==============================================================
        # CASE 2: No draft → create from live
        # ==============================================================
        else:
            live = db_service.current_live_version
            if live is None:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot create draft: no live version exists",
                )

            logger.info(
                "Creating new draft from live: service=%s live_version=%s",
                db_service.id, live.id,
            )
            await _load_version_collections(db, live)

            draft = ServiceVersion(
                service_id=db_service.id,
                version_number=await _next_version_number(db, db_service.id),
                # status set below after save_draft decision
                status="draft",  # temporary; overwritten below
                service_name=parsed.service_name,
                description=parsed.description,
                add_line1=parsed.add_line1,
                add_line2=parsed.add_line2,
                area=parsed.area,
                city=parsed.city,
                state=parsed.state,
                country=parsed.country or "India",
                pincode=parsed.pincode,
                latitude=parsed.latitude,
                longitude=parsed.longitude,
                metadata_=(
                    parsed.metadata_.model_dump() if parsed.metadata_ else {}
                ),
            )
            db.add(draft)
            await db.flush()

            db_service.current_draft_version_id = draft.id
            await db.flush()

            _clone_type_specific_details(
                db, source_version=live, target_version_id=draft.id,
            )
            await db.flush()
            await _load_type_specific_details(db, draft)

            _clone_variants(db, source_version=live, target_version_id=draft.id)
            media_id_map = _clone_media(
                db, source_version=live, target_version_id=draft.id,
            )
            await db.flush()   # populates ids of the cloned media rows
            await _load_version_collections(db, draft)

            _update_type_specific(db, draft, parsed)

        # ==============================================================
        # STATUS: draft vs submit for review
        # ==============================================================
        if save_draft:
            draft.status = "draft"
            if db_service.status in (
                ServiceStatusEnum.draft,
                ServiceStatusEnum.under_review,
                ServiceStatusEnum.needs_revision,
                ServiceStatusEnum.rejected,
            ):
                db_service.status = ServiceStatusEnum.draft
        else:
            draft.status = "under_review"
            draft.submitted_at = _utcnow()
            if db_service.status != ServiceStatusEnum.live:
                db_service.status = ServiceStatusEnum.under_review
            # If already live: service stays live; draft is under_review
            # until admin publishes.

        # ==============================================================
        # VARIANTS – always replace with submitted payload
        # ==============================================================
        parsed.variants = _enforce_variants(parsed.variants)

        await db.execute(
            delete(ServiceVariant).where(
                ServiceVariant.service_version_id == draft.id
            )
        )
        for variant in parsed.variants:
            db.add(
                ServiceVariant(
                    service_version_id=draft.id,
                    variant_name=variant.variant_name,
                    description=variant.description,
                    min_quantity=variant.min_quantity,
                    max_quantity=variant.max_quantity,
                    pricing_type=variant.pricing_type,
                    currency=variant.currency,
                    pricing=variant.pricing or {},
                    menu=variant.menu or [],
                    deliverables=variant.deliverables or [],
                    inclusions=variant.inclusions or [],
                    exclusions=variant.exclusions or [],
                    policies=variant.policies or {},
                    metadata_=variant.metadata_ or {},
                    is_default=variant.is_default,
                )
            )

        # ==============================================================
        # MEDIA RETENTION (fixed)
        # ==============================================================
        # media_mode / keep_ids / existing_cover_flags were parsed above by
        # _parse_existing_media (handles bare ids and {id, is_cover} objects).

        # Frontend may still hold LIVE ids while we are editing a CLONED
        # draft. Translate them to the cloned rows' ids (no-op for ids
        # that already belong to this draft).
        if keep_ids and media_id_map:
            keep_ids = [
                media_id_map[i].id if i in media_id_map else i
                for i in keep_ids
            ]

        if not is_new_draft:
            # ---- existing draft ----
            if media_mode == "keep_none":
                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_version_id == draft.id,
                    )
                )
            elif media_mode == "keep_ids":
                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_version_id == draft.id,
                        ServiceMedia.id.notin_(keep_ids),
                    )
                )
            # keep_all → no delete
        else:
            # ---- new draft cloned from live ----
            # Cloned rows have NEW primary keys. Frontend usually still has
            # LIVE ids (translated above). Only prune when keep_ids actually
            # match THIS draft.
            if media_mode == "keep_ids" and keep_ids:
                result = await db.execute(
                    select(ServiceMedia.id).where(
                        ServiceMedia.service_version_id == draft.id,
                        ServiceMedia.id.in_(keep_ids),
                    )
                )
                matched = {r[0] for r in result.all()}
                if matched:
                    await db.execute(
                        delete(ServiceMedia).where(
                            ServiceMedia.service_version_id == draft.id,
                            ServiceMedia.id.notin_(keep_ids),
                        )
                    )
                # else: ids look like live-version ids → ignore, keep full clone
            elif media_mode == "keep_none":
                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_version_id == draft.id,
                    )
                )
            # keep_all → keep full clone

        # Next display_order
        result = await db.execute(
            select(func.max(ServiceMedia.display_order)).where(
                ServiceMedia.service_version_id == draft.id
            )
        )
        max_order = result.scalar_one_or_none()
        display_order = (max_order if max_order is not None else -1) + 1

        # New images — inserted as NON-cover on purpose; their cover flag is
        # applied together with the existing_media flags below, so the
        # number of covers never exceeds the limit midway.
        new_cover_rows: list[ServiceMedia] = []

        for img, is_cover in zip(images, cover_flags):
            url = await _upload_media(img)
            row = ServiceMedia(
                service_version_id=draft.id,
                media_url=url,
                media_type="image",
                is_cover=False,
                display_order=display_order,
                metadata_={},
            )
            db.add(row)
            if is_cover:
                new_cover_rows.append(row)
            display_order += 1

        # New videos
        for video in videos:
            url = await _upload_media(video)
            db.add(
                ServiceMedia(
                    service_version_id=draft.id,
                    media_url=url,
                    media_type="video",
                    is_cover=False,
                    display_order=display_order,
                    metadata_={},
                )
            )
            display_order += 1

        # External media
        for item in parse_json_list(external_media):
            db.add(
                ServiceMedia(
                    service_version_id=draft.id,
                    media_url=item["media_url"],
                    media_type=item.get("media_type", "image"),
                    is_cover=False,
                    display_order=display_order,
                    metadata_=item.get("metadata", {}),
                )
            )
            display_order += 1

        # ==============================================================
        # COVER
        # ==============================================================
        await db.flush()   # populate ids of newly added media rows

        # Collect every cover flag to apply: existing_media entries (ids
        # translated onto cloned rows when needed) + flagged new images.
        flags_to_apply: dict[int, bool] = {}

        for media_id, value in existing_cover_flags.items():
            target_id = (
                media_id_map[media_id].id
                if media_id in media_id_map
                else media_id
            )
            flags_to_apply[target_id] = value

        for row in new_cover_rows:
            flags_to_apply[row.id] = True

        if flags_to_apply:
            if not await _apply_cover_flags(db, draft.id, flags_to_apply):
                await db.rollback()
                raise HTTPException(
                    status_code=400,
                    detail={
                        "field": "existing_media",
                        "message": (
                            "existing_media contains media that does not "
                            "belong to this service."
                        ),
                    },
                )

        # Final check: total covers on this version (retained + new).
        cover_total = await _count_covers(db, draft.id)
        if cover_total > MAX_COVER_IMAGES:
            await db.rollback()
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "image_is_cover",
                    "message": (
                        f"Maximum {MAX_COVER_IMAGES} cover images allowed "
                        f"(this update would result in {cover_total})."
                    ),
                },
            )

        # If no cover remains (e.g. old cover removed), promote one.
        await _ensure_cover(db, draft.id)

        await db.commit()

        logger.info(
            "Service updated: service=%s draft=%s new_draft=%s status=%s save_draft=%s",
            db_service.id,
            draft.id,
            is_new_draft,
            draft.status,
            save_draft,
        )

        return ServiceCreateResponse(
            message=(
                "Draft saved successfully"
                if save_draft
                else "Service updated successfully"
            ),
            service_id=db_service.id,
        )

    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.exception("update_service_controller failed")
        raise HTTPException(status_code=500, detail="Failed to update service")


# ---------------------------------------------------------------------------
# DELETE - SOFT DELETE
# ---------------------------------------------------------------------------

async def delete_service_controller(
    service_id: int,
    db: AsyncSession,
    current_user: dict,
) -> dict:

    try:

        _require_vendor(current_user)

        db_service = await get_service_with_relations(
            service_id,
            db,
            current_user,
        )

        if not db_service:

            raise HTTPException(
                status_code=404,
                detail="Service not found",
            )

        # Preserve all version/history data.
        db_service.deleted_at = _utcnow()
        db_service.is_active = False

        await db.commit()

        logger.info(
            "Service soft-deleted: id=%s",
            service_id,
        )

        return {
            "message": "Service deleted successfully"
        }

    except HTTPException:
        raise

    except Exception:

        await db.rollback()

        logger.exception(
            "delete_service_controller failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete service",
        )


# ---------------------------------------------------------------------------
# Private utilities
# ---------------------------------------------------------------------------

def _parse_json_list(raw: str) -> list:
    """
    Safely parse a JSON string into a list.

    Returns [] when:
      - raw is empty
      - JSON is invalid
      - parsed value is not a list
    """

    if not raw:
        return []

    try:

        result = json.loads(raw)

        return (
            result
            if isinstance(result, list)
            else []
        )

    except (
        json.JSONDecodeError,
        TypeError,
    ):

        return []