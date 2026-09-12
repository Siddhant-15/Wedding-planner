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

Delete flow:
  - Soft-delete only: sets service.deleted_at
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, func, select
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

async def _load_type_specific_details(
    db: AsyncSession,
    version: ServiceVersion,
) -> None:
    await db.refresh(
        version,
        attribute_names=list(TYPE_DETAIL_RELATIONSHIPS),
    )


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
) -> int:
    """
    Clone media records from source version to target version.

    IMPORTANT:
    The cloned media records are new/pending SQLAlchemy objects. We do not
    attempt to delete them during the same request.

    Returns:
        Number of media records cloned.
    """

    count = 0

    for media in source_version.media:

        db.add(
            ServiceMedia(
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
        )

        count += 1

    return count


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

async def create_service_controller(
    data: str,
    images: list,
    external_media: str,
    db: AsyncSession,
    current_user: dict,
) -> ServiceCreateResponse:

    try:
        _require_vendor(current_user)

        vendor_id = await _resolve_vendor_id(
            db,
            current_user["email"],
        )

        parsed = ServiceCreate(
            **json.loads(data)
        )

        # ---------------------------------------------------------------
        # 1. Service row
        # ---------------------------------------------------------------

        db_service = Service(
            vendor_id=vendor_id,
            service_type=parsed.service_type,
            status=ServiceStatusEnum.under_review,
            is_active=False,
        )

        db.add(db_service)

        await db.flush()

        # ---------------------------------------------------------------
        # 2. ServiceVersion v1
        # ---------------------------------------------------------------

        version = ServiceVersion(
            service_id=db_service.id,
            version_number=1,
            status="under_review",

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
                parsed.metadata_.model_dump()
                if parsed.metadata_
                else {}
            ),
        )

        db.add(version)

        await db.flush()

        # ---------------------------------------------------------------
        # 3. Point service to draft version
        # ---------------------------------------------------------------

        db_service.current_draft_version_id = version.id

        await db.flush()

        # ---------------------------------------------------------------
        # 4. Type-specific detail
        # ---------------------------------------------------------------

        _add_type_specific(
            db,
            version.id,
            parsed,
        )

        # ---------------------------------------------------------------
        # 5. Variants
        # ---------------------------------------------------------------

        parsed.variants = _enforce_variants(
            parsed.variants
        )

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

                    pricing=(
                        variant.pricing
                        if variant.pricing
                        else {}
                    ),

                    menu=(
                        variant.menu
                        if variant.menu
                        else []
                    ),

                    deliverables=(
                        variant.deliverables
                        if variant.deliverables
                        else []
                    ),

                    inclusions=(
                        variant.inclusions
                        if variant.inclusions
                        else []
                    ),

                    exclusions=(
                        variant.exclusions
                        if variant.exclusions
                        else []
                    ),

                    policies=(
                        variant.policies
                        if variant.policies
                        else {}
                    ),

                    metadata_=(
                        variant.metadata_
                        if variant.metadata_
                        else {}
                    ),

                    is_default=variant.is_default,
                )
            )

        # ---------------------------------------------------------------
        # 6. Media
        # ---------------------------------------------------------------

        display_order = 0

        for img in images:

            url = await _upload_media(img)

            db.add(
                ServiceMedia(
                    service_version_id=version.id,
                    media_url=url,
                    media_type="image",
                    is_cover=(display_order == 0),
                    display_order=display_order,
                    metadata_={},
                )
            )

            display_order += 1

        for item in _parse_json_list(external_media):

            db.add(
                ServiceMedia(
                    service_version_id=version.id,
                    media_url=item["media_url"],
                    media_type=item.get(
                        "media_type",
                        "image",
                    ),
                    is_cover=False,
                    display_order=display_order,
                    metadata_=item.get(
                        "metadata",
                        {},
                    ),
                )
            )

            display_order += 1

        await db.commit()

        logger.info(
            "Service created: id=%s version=%s vendor=%s",
            db_service.id,
            version.id,
            vendor_id,
        )

        return ServiceCreateResponse(
            message="Service created successfully",
            service_id=db_service.id,
        )

    except HTTPException:
        raise

    except Exception:

        await db.rollback()

        logger.exception(
            "create_service_controller failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create service",
        )


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
    existing_media: str,
    images: list,
    videos: list,
    external_media: str,
    db: AsyncSession,
    current_user: dict,
):

    try:

        _require_vendor(current_user)

        # ---------------------------------------------------------------
        # Load service + both draft/live versions
        # ---------------------------------------------------------------

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

        parsed = ServiceCreate(
            **json.loads(data)
        )

        # ---------------------------------------------------------------
        # Resolve draft
        # ---------------------------------------------------------------

        draft = db_service.current_draft_version

        is_new_draft = draft is None

        # ===============================================================
        # CASE 1: Existing draft
        # ===============================================================

        if not is_new_draft:

            logger.info(
                "Updating existing draft: service=%s draft_version=%s",
                db_service.id,
                draft.id,
            )

            # MUST load collections before any access
            await _load_version_collections(db, draft)

            # -----------------------------------------------------------
            # Update base fields
            # -----------------------------------------------------------

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
                parsed.metadata_.model_dump()
                if parsed.metadata_
                else {}
            )

            # -----------------------------------------------------------
            # Type-specific detail
            # -----------------------------------------------------------

            _update_type_specific(
                db,
                draft,
                parsed,
            )

        # ===============================================================
        # CASE 2: No draft → create from live
        # ===============================================================

        else:

            live = db_service.current_live_version

            if live is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Cannot create draft: "
                        "no live version exists"
                    ),
                )

            logger.info(
                "Creating new draft from live: "
                "service=%s live_version=%s",
                db_service.id,
                live.id,
            )

            # Load live collections before cloning
            await _load_version_collections(db, live)

            # -----------------------------------------------------------
            # Create new version
            # -----------------------------------------------------------

            draft = ServiceVersion(
                service_id=db_service.id,

                version_number=await _next_version_number(
                    db,
                    db_service.id,
                ),

                status="under_review",

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
                    parsed.metadata_.model_dump()
                    if parsed.metadata_
                    else {}
                ),
            )

            db.add(draft)
            await db.flush()

            db_service.current_draft_version_id = draft.id
            await db.flush()

            # -----------------------------------------------------------
            # Clone type-specific detail
            # -----------------------------------------------------------

            _clone_type_specific_details(
                db,
                source_version=live,
                target_version_id=draft.id,
            )
            await db.flush()

            await _load_type_specific_details(db, draft)

            # -----------------------------------------------------------
            # Clone variants + media
            # -----------------------------------------------------------

            variants_count = _clone_variants(
                db,
                source_version=live,
                target_version_id=draft.id,
            )

            media_count = _clone_media(
                db,
                source_version=live,
                target_version_id=draft.id,
            )

            await db.flush()

            # Load collections on the new draft
            await _load_version_collections(db, draft)

            logger.debug(
                "Cloned live data into draft: "
                "draft=%s variants=%s media=%s",
                draft.id,
                variants_count,
                media_count,
            )

            # Apply submitted type-specific changes
            _update_type_specific(
                db,
                draft,
                parsed,
            )

        # ===============================================================
        # VARIANTS – always replace with submitted payload
        # ===============================================================

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

        # ===============================================================
        # MEDIA
        # ===============================================================

        keep_ids = (
            _parse_json_list(existing_media)
            if existing_media
            else []
        )

        # ---------------------------------------------------------------
        # Existing draft only: delete media the vendor removed
        # Use a pure SQL delete – never iterate draft.media
        # ---------------------------------------------------------------

        if not is_new_draft:
            if keep_ids:
                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_version_id == draft.id,
                        ServiceMedia.id.notin_(keep_ids),
                    )
                )
            else:
                # keep_ids empty → remove everything
                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_version_id == draft.id,
                    )
                )

        # ---------------------------------------------------------------
        # New draft:
        # We already cloned live media. Do NOT delete them here.
        # Frontend can later send keep_ids if it wants to prune.
        # ---------------------------------------------------------------

        # ---------------------------------------------------------------
        # Next display_order – pure query, zero relationship access
        # ---------------------------------------------------------------

        result = await db.execute(
            select(func.max(ServiceMedia.display_order)).where(
                ServiceMedia.service_version_id == draft.id
            )
        )
        max_order = result.scalar_one_or_none()
        display_order = (max_order if max_order is not None else -1) + 1

        # ---------------------------------------------------------------
        # New images
        # ---------------------------------------------------------------

        for img in images:

            url = await _upload_media(img)

            db.add(
                ServiceMedia(
                    service_version_id=draft.id,
                    media_url=url,
                    media_type="image",
                    is_cover=False,
                    display_order=display_order,
                    metadata_={},
                )
            )
            display_order += 1

        # ---------------------------------------------------------------
        # New videos
        # ---------------------------------------------------------------

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

        # ---------------------------------------------------------------
        # External media
        # ---------------------------------------------------------------

        for item in _parse_json_list(external_media):

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

        # ===============================================================
        # COMMIT
        # ===============================================================

        await db.commit()

        logger.info(
            "Service updated successfully: "
            "service=%s draft_version=%s new_draft=%s",
            db_service.id,
            draft.id,
            is_new_draft,
        )

        return ServiceCreateResponse(
            message="Service updated successfully",
            service_id=db_service.id,
        )

    except HTTPException:
        raise

    except Exception:

        await db.rollback()

        logger.exception(
            "update_service_controller failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update service",
        )
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