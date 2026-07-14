"""
app/controller/Vendor/service_controller.py

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
  1. Insert Service  (type, vendor_id, status=draft)
  2. Insert ServiceVersion v1  (all mutable content)
  3. Set service.current_draft_version_id = v1.id
  4. Insert variants / media / type-detail linked to v1.id

Update flow (vendor edits a draft):
  - If a draft version already exists  → mutate it in place
  - If only a live version exists       → create a new draft version (v+1)
    and point current_draft_version_id at it

Delete flow:
  - Soft-delete only: sets service.deleted_at
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    Service,
    ServiceMedia,
    ServiceVariant,
    ServiceVersion,
    Vendor,
)
from app.repositories.Vendor.service_repository import (
    get_all_vendor_services,
    get_service_with_relations,
)
from app.schemas.services import (
    ServiceCreate,
    ServiceCreateResponse,
    ServiceStatusEnum,
)
from app.utils.Vendor.media_utils import _upload_media
from app.utils.Vendor.service_helpers import (
    _active_version,
    _add_type_specific,
    _build_service_response,
    _enforce_variants,
    _update_type_specific,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _require_vendor(current_user: dict) -> None:
    if current_user.get("role") != "vendor":
        raise HTTPException(status_code=403, detail="Vendor role required")


async def _resolve_vendor_id(db: AsyncSession, email: str) -> int:
    result = await db.execute(
        select(Vendor.id).where(Vendor.email == email)
    )
    vendor_id = result.scalar_one_or_none()
    if not vendor_id:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor_id


def _next_version_number(service: Service) -> int:
    """Derive the next version_number from existing versions."""
    if not service.versions:
        return 1
    return max(v.version_number for v in service.versions) + 1


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
        vendor_id = await _resolve_vendor_id(db, current_user["email"])

        parsed = ServiceCreate(**json.loads(data))

        # ── 1. Service row (immutable shell) ──────────────────────────────
        db_service = Service(
            vendor_id=vendor_id,
            service_type=parsed.service_type,
            status=ServiceStatusEnum.draft,
            is_active=False,
        )
        db.add(db_service)
        await db.flush()          # get db_service.id

        # ── 2. ServiceVersion v1 ──────────────────────────────────────────
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
            metadata_=parsed.metadata_.model_dump() if parsed.metadata_ else {},
        )
        db.add(version)
        await db.flush()          # get version.id

        # ── 3. Point service at the new draft version ─────────────────────
        db_service.current_draft_version_id = version.id
        await db.flush()

        # ── 4. Type-specific detail row ───────────────────────────────────
        _add_type_specific(db, version.id, parsed)

        # ── 5. Variants ───────────────────────────────────────────────────
        parsed.variants = _enforce_variants(parsed.variants)
        for v in parsed.variants:
            db.add(ServiceVariant(
                service_version_id=version.id,
                variant_name=v.variant_name,
                description=v.description,
                min_quantity=v.min_quantity,
                max_quantity=v.max_quantity,
                pricing_type=v.pricing_type,
                currency=v.currency,
                pricing=v.pricing or {},
                menu=v.menu or [],
                deliverables=v.deliverables or [],
                inclusions=v.inclusions or [],
                exclusions=v.exclusions or [],
                policies=v.policies or {},
                metadata_=v.metadata_ or {},
                is_default=v.is_default,
            ))

        # ── 6. Media ──────────────────────────────────────────────────────
        display_order = 0

        for img in images:
            url = await _upload_media(img)
            db.add(ServiceMedia(
                service_version_id=version.id,
                media_url=url,
                media_type="image",
                is_cover=(display_order == 0),
                display_order=display_order,
                metadata_={},
            ))
            display_order += 1

        for item in _parse_json_list(external_media):
            db.add(ServiceMedia(
                service_version_id=version.id,
                media_url=item["media_url"],
                media_type=item.get("media_type", "image"),
                is_cover=False,
                display_order=display_order,
                metadata_=item.get("metadata", {}),
            ))
            display_order += 1

        await db.commit()
        logger.info("Service created: id=%s version=%s vendor=%s",
                    db_service.id, version.id, vendor_id)

        return ServiceCreateResponse(
            message="Service created successfully",
            service_id=db_service.id,
        )

    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.exception("create_service_controller failed")
        raise HTTPException(status_code=500, detail="Failed to create service")


# ---------------------------------------------------------------------------
# READ (all / single)
# ---------------------------------------------------------------------------

async def get_all_services_controller(
    db: AsyncSession,
    current_user: dict,
) -> list:
    _require_vendor(current_user)
    services = await get_all_vendor_services(db, current_user)
    return [_build_service_response(s) for s in services]


async def get_service_controller(
    service_id: int,
    db: AsyncSession,
    current_user: dict,
):
    _require_vendor(current_user)
    db_service = await get_service_with_relations(service_id, db, current_user)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return _build_service_response(db_service)


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

        db_service = await get_service_with_relations(service_id, db, current_user)
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        parsed = ServiceCreate(**json.loads(data))

        # ── Resolve or create the draft version ───────────────────────────
        draft = db_service.current_draft_version

        if draft is None:
            # Vendor is editing a live service → create new draft version
            draft = ServiceVersion(
                service_id=db_service.id,
                version_number=_next_version_number(db_service),
                status="draft",
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
                metadata_=parsed.metadata_.model_dump() if parsed.metadata_ else {},
            )
            db.add(draft)
            await db.flush()

            db_service.current_draft_version_id = draft.id
            await db.flush()

            # Copy type-specific detail into new version
            _add_type_specific(db, draft.id, parsed)

        else:
            # Mutate the existing draft version's fields
            draft.service_name = parsed.service_name
            draft.description  = parsed.description
            draft.add_line1    = parsed.add_line1
            draft.add_line2    = parsed.add_line2
            draft.area         = parsed.area
            draft.city         = parsed.city
            draft.state        = parsed.state
            draft.country      = parsed.country or "India"
            draft.pincode      = parsed.pincode
            draft.latitude     = parsed.latitude
            draft.longitude    = parsed.longitude
            draft.metadata_    = (
                parsed.metadata_.model_dump() if parsed.metadata_ else {}
            )

            # Upsert the type-specific detail row
            _update_type_specific(db, draft, parsed)

        # ── Variants: replace all on the draft version ────────────────────
        parsed.variants = _enforce_variants(parsed.variants)

        await db.execute(
            delete(ServiceVariant).where(
                ServiceVariant.service_version_id == draft.id
            )
        )

        for v in parsed.variants:
            db.add(ServiceVariant(
                service_version_id=draft.id,
                variant_name=v.variant_name,
                description=v.description,
                min_quantity=v.min_quantity,
                max_quantity=v.max_quantity,
                pricing_type=v.pricing_type,
                currency=v.currency,
                pricing=v.pricing or {},
                menu=v.menu or [],
                deliverables=v.deliverables or [],
                inclusions=v.inclusions or [],
                exclusions=v.exclusions or [],
                policies=v.policies or {},
                metadata_=v.metadata_ or {},
                is_default=v.is_default,
            ))

        # ── Media: keep retained + add new ────────────────────────────────
        keep_ids = _parse_json_list(existing_media) if existing_media else []

        for media in list(draft.media):
            if media.id not in keep_ids:
                await db.delete(media)

        display_order = len(keep_ids)

        for img in images:
            url = await _upload_media(img)
            db.add(ServiceMedia(
                service_version_id=draft.id,
                media_url=url,
                media_type="image",
                is_cover=False,
                display_order=display_order,
                metadata_={},
            ))
            display_order += 1

        for video in videos:
            url = await _upload_media(video)
            db.add(ServiceMedia(
                service_version_id=draft.id,
                media_url=url,
                media_type="video",
                is_cover=False,
                display_order=display_order,
                metadata_={},
            ))
            display_order += 1

        for item in _parse_json_list(external_media):
            db.add(ServiceMedia(
                service_version_id=draft.id,
                media_url=item["media_url"],
                media_type=item.get("media_type", "image"),
                is_cover=False,
                display_order=display_order,
                metadata_=item.get("metadata", {}),
            ))
            display_order += 1

        await db.commit()
        await db.refresh(db_service)

        logger.info("Service updated: id=%s draft_version=%s", db_service.id, draft.id)

        return ServiceCreateResponse(
            message="Service updated successfully",
            service_id=db_service.id,
        )

    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.exception("update_service_controller failed")
        raise HTTPException(status_code=500, detail="Failed to update service")


# ---------------------------------------------------------------------------
# DELETE (soft)
# ---------------------------------------------------------------------------

async def delete_service_controller(
    service_id: int,
    db: AsyncSession,
    current_user: dict,
) -> dict:
    try:
        _require_vendor(current_user)

        db_service = await get_service_with_relations(service_id, db, current_user)
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        # Soft delete — preserve data for audit / dispute purposes
        db_service.deleted_at = _utcnow()
        db_service.is_active  = False

        await db.commit()
        logger.info("Service soft-deleted: id=%s", service_id)

        return {"message": "Service deleted successfully"}

    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.exception("delete_service_controller failed")
        raise HTTPException(status_code=500, detail="Failed to delete service")


# ---------------------------------------------------------------------------
# Private utils
# ---------------------------------------------------------------------------

def _parse_json_list(raw: str) -> list:
    """Safely parse a JSON string into a list; returns [] on failure."""
    if not raw:
        return []
    try:
        result = json.loads(raw)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, TypeError):
        return []