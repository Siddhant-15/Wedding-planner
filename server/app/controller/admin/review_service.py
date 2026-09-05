# app/services/review_service.py
#
# ADJUST all imports in the block below to your actual module paths.
# Everything else (`get_service_for_review`, `_review_service_opts`,
# `write_version_audit`) is used exactly as in your existing admin router,
# just imported instead of redefined.
import enum
from datetime import datetime, timezone
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID as PythonUUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Service, ServiceVersion, ServiceVariant, ServiceMedia
from app.models.models import (
    ServiceVersionReviewItem,
    ReviewSection,
    ReviewItemStatus,
)
from app.schemas.admin.schemas_review import (
    ReviewDataResponse,
    ReviewFinalizeAction,
    ReviewFinalizeRequest,
    ReviewFinalizeResponse,
    ReviewHistoryResponse,
    ReviewHistoryVersionEntry,
    ReviewProgressSummary,
    ReviewSectionEnum,
    SectionReviewResponse,
    SectionReviewUpdateRequest,
    VersionChangeSummary,
)
from app.repositories.admin.admin_repository import (
    get_service_for_review,
    _review_service_opts,
    write_version_audit,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------
# Applicable sections
# --------------------------------------------------------------------------
# Single source of truth for which sections apply to a version. Today every
# section applies to every service type -- an empty pricing_variants or
# media list just means the reviewer trivially marks it "Looks Good" rather
# than being blocked. Kept as a function (not a constant) so a future
# service type that genuinely has no `service_details` sub-table, for
# example, can be excluded here without touching the router or frontend
# (the frontend gets its section list from the same GET response this
# function feeds).

ALL_SECTIONS: List[ReviewSection] = [
    ReviewSection.basic_information,
    ReviewSection.location,
    ReviewSection.media,
    ReviewSection.pricing_variants,
    ReviewSection.service_details,
    ReviewSection.policies_metadata,
]


def get_applicable_sections(service: Service, version: ServiceVersion) -> List[ReviewSection]:
    return list(ALL_SECTIONS)


# --------------------------------------------------------------------------
# Idempotent review-item initialization
# --------------------------------------------------------------------------

async def ensure_review_items_for_version(
    db: AsyncSession, service: Service, version: ServiceVersion
) -> None:
    """
    Call this when a version transitions draft -> under_review.
    Safe to call multiple times: only creates rows for sections that don't
    already have one. Never copies comments from a previous version's
    review items -- those stay attached to the version they were made on.
    """
    applicable = get_applicable_sections(service, version)

    existing = await db.execute(
        select(ServiceVersionReviewItem.section).where(
            ServiceVersionReviewItem.service_version_id == version.id
        )
    )
    existing_sections = {row[0] for row in existing.all()}

    to_create = [s for s in applicable if s.value not in existing_sections and s not in existing_sections]
    for section in to_create:
        db.add(
            ServiceVersionReviewItem(
                service_version_id=version.id,
                section=section,
                status=ReviewItemStatus.pending,
            )
        )
    if to_create:
        await db.flush()


# --------------------------------------------------------------------------
# Change summary (lightweight, not a full diff engine)
# --------------------------------------------------------------------------

def _build_change_summary(
    service: Service, draft: ServiceVersion, live: Optional[ServiceVersion]
) -> VersionChangeSummary:
    is_update = live is not None and live.id != draft.id

    if not is_update or live is None:
        return VersionChangeSummary(is_update_to_live=False)

    # Match variants by name (stable-ish across your deep-copy-on-new-version
    # flow). If your version-cloning logic carries a stable logical id
    # forward (e.g. a `lineage_id` distinct from the per-row `id`), swap the
    # key below to that instead -- it will be more reliable than name
    # matching if two variants are ever renamed to the same thing.
    live_by_name = {v.variant_name: v for v in (live.variants or [])}
    draft_by_name = {v.variant_name: v for v in (draft.variants or [])}

    added = [n for n in draft_by_name if n not in live_by_name]
    removed = [n for n in live_by_name if n not in draft_by_name]
    modified = [
        n
        for n in draft_by_name
        if n in live_by_name and live_by_name[n].pricing != draft_by_name[n].pricing
    ]

    live_media_urls = {m.media_url for m in (live.media or [])}
    draft_media_urls = {m.media_url for m in (draft.media or [])}
    media_added = len(draft_media_urls - live_media_urls)
    media_removed = len(live_media_urls - draft_media_urls)

    live_cover = next((m.media_url for m in (live.media or []) if m.is_cover), None)
    draft_cover = next((m.media_url for m in (draft.media or []) if m.is_cover), None)

    return VersionChangeSummary(
        is_update_to_live=True,
        variants_added=len(added),
        variants_removed=len(removed),
        variants_modified=len(modified),
        media_added=media_added,
        media_removed=media_removed,
        cover_changed=(live_cover != draft_cover),
        basic_information_changed=(
            live.service_name != draft.service_name
            or live.description != draft.description
        ),
        location_changed=(
            live.add_line1 != draft.add_line1
            or live.city != draft.city
            or live.pincode != draft.pincode
        ),
    )


def _serialize_model(instance) -> Optional[Dict[str, Any]]:
    """
    Serialize a SQLAlchemy ORM instance using only its table columns.
    This prevents raw ORM objects from reaching FastAPI/Pydantic.
    """
    if instance is None:
        return None

    data: Dict[str, Any] = {}

    for column in instance.__table__.columns:
        key = column.name
        value = getattr(instance, key)

        if isinstance(value, enum.Enum):
            value = value.value
        elif isinstance(value, Decimal):
            value = str(value)
        elif isinstance(value, (datetime, date, time)):
            value = value.isoformat()
        elif isinstance(value, PythonUUID):
            value = str(value)

        data[key] = value

    return data


def _serialize_version(version: Optional[ServiceVersion]) -> Optional[Dict[str, Any]]:
    """
    JSON-safe serializer for the review UI.
    """
    if version is None:
        return None

    detail = None

    detail_mapping = (
        ("venue_detail", "venue"),
        ("catering_detail", "catering"),
        ("dj_detail", "dj"),
        ("photography_detail", "photography"),
        ("event_management_detail", "event_management"),
        ("makeup_artist_detail", "makeup_artist"),
    )

    for attr, detail_type in detail_mapping:
        value = getattr(version, attr, None)

        if value is not None:
            detail = {
                "type": detail_type,
                "data": _serialize_model(value),
            }
            break

    return {
        "id": version.id,
        "version_number": version.version_number,
        "status": (
            version.status.value
            if isinstance(version.status, enum.Enum)
            else version.status
        ),
        "service_name": version.service_name,
        "description": version.description,

        "add_line1": version.add_line1,
        "add_line2": version.add_line2,
        "area": version.area,
        "city": version.city,
        "state": version.state,
        "country": version.country,
        "pincode": version.pincode,

        "latitude": (
            str(version.latitude)
            if version.latitude is not None
            else None
        ),
        "longitude": (
            str(version.longitude)
            if version.longitude is not None
            else None
        ),

        "metadata": version.metadata_,

        "variants": [
            {
                "id": v.id,
                "variant_name": v.variant_name,
                "description": v.description,
                "min_quantity": v.min_quantity,
                "max_quantity": v.max_quantity,
                "pricing_type": v.pricing_type,
                "currency": v.currency,
                "pricing": v.pricing,
                "menu": v.menu,
                "deliverables": v.deliverables,
                "inclusions": v.inclusions,
                "exclusions": v.exclusions,
                "policies": v.policies,
                "metadata": v.metadata_,
                "is_default": v.is_default,
                "is_active": v.is_active,
            }
            for v in (version.variants or [])
        ],

        "media": [
            {
                "id": m.id,
                "media_url": m.media_url,
                "media_type": m.media_type,
                "is_cover": m.is_cover,
                "display_order": m.display_order,
                "metadata": m.metadata_,
            }
            for m in (version.media or [])
        ],

        "detail": detail,
    }

def _admin_name(admin) -> Optional[str]:
    if admin is None:
        return None
    first = getattr(admin, "first_name", "") or ""
    last = getattr(admin, "last_name", "") or ""
    name = f"{first} {last}".strip()
    return name or getattr(admin, "email", None)


# --------------------------------------------------------------------------
# GET review data
# --------------------------------------------------------------------------

async def get_review_data(db: AsyncSession, service_id: int) -> ReviewDataResponse:
    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    version = service.current_draft_version
    if not version:
        raise HTTPException(
            status_code=409, detail="No draft version found for this service."
        )

    await ensure_review_items_for_version(db, service, version)
    await db.flush()

    items_result = await db.execute(
        select(ServiceVersionReviewItem)
        .where(ServiceVersionReviewItem.service_version_id == version.id)
        .order_by(ServiceVersionReviewItem.id)
    )
    items = items_result.scalars().all()

    sections = [
        SectionReviewResponse(
            section=ReviewSectionEnum(item.section),
            status=item.status,
            comment=item.comment,
            reviewed_by=item.reviewed_by,
            reviewed_by_name=_admin_name(item.reviewer),
            reviewed_at=item.reviewed_at,
        )
        for item in items
    ]

    approved = sum(1 for s in sections if s.status == "approved")
    changes_requested = sum(1 for s in sections if s.status == "changes_requested")
    reviewed = approved + changes_requested

    progress = ReviewProgressSummary(
        total_sections=len(sections),
        reviewed_sections=reviewed,
        approved_sections=approved,
        changes_requested_sections=changes_requested,
        can_approve=(reviewed == len(sections) and changes_requested == 0 and len(sections) > 0),
        can_request_changes=(changes_requested > 0),
    )

    live = service.current_live_version
    is_update = bool(live and live.id != version.id)

    return ReviewDataResponse(
        service_id=service.id,
        version_id=version.id,
        version_number=getattr(version, "version_number", None),
        version_status=version.status,
        service_status=service.status,
        is_update_to_live_service=is_update,
        sections=sections,
        progress=progress,
        change_summary=_build_change_summary(service, version, live) if is_update else None,
        version_data=_serialize_version(version),
        live_version_data=_serialize_version(live) if is_update else None,
    )


# --------------------------------------------------------------------------
# PUT section review
# --------------------------------------------------------------------------

async def update_review_section(
    db: AsyncSession,
    service_id: int,
    section: ReviewSectionEnum,
    payload: SectionReviewUpdateRequest,
    current_admin: dict,
) -> SectionReviewResponse:
    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    version = service.current_draft_version
    if not version:
        raise HTTPException(status_code=409, detail="No draft version found.")

    if version.status != "under_review":
        raise HTTPException(
            status_code=409,
            detail=f"Version is in '{version.status}' status. Sections can only be "
            "reviewed while the version is under_review.",
        )

    applicable = get_applicable_sections(service, version)
    if ReviewSection(section.value) not in applicable:
        raise HTTPException(
            status_code=422, detail=f"Section '{section.value}' is not applicable to this version."
        )

    result = await db.execute(
        select(ServiceVersionReviewItem).where(
            ServiceVersionReviewItem.service_version_id == version.id,
            ServiceVersionReviewItem.section == section.value,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        # Defensive: should already exist via ensure_review_items_for_version,
        # but handle the race where GET hasn't been called yet for this version.
        item = ServiceVersionReviewItem(
            service_version_id=version.id, section=section.value
        )
        db.add(item)
        await db.flush()

    old_status = item.status
    item.status = payload.status.value
    # Business decision (per spec, "explain and implement consistently"):
    # approving a section clears its comment -- once approved there's
    # nothing outstanding to show the vendor. The audit log below still
    # preserves what the comment *was* at the moment of the decision, so
    # nothing is lost, it's just no longer surfaced as "current feedback".
    item.comment = payload.comment.strip() if payload.status == "changes_requested" else None
    item.reviewed_by = current_admin["id"]
    item.reviewed_at = _utcnow()

    await write_version_audit(
        db,
        version_id=version.id,
        action=f"section_{payload.status.value}",
        performed_by=current_admin["id"],
        old_data={"section": section.value, "status": old_status},
        new_data={"section": section.value, "status": item.status, "comment": item.comment},
    )

    await db.commit()
    await db.refresh(item)

    return SectionReviewResponse(
        section=ReviewSectionEnum(item.section),
        status=item.status,
        comment=item.comment,
        reviewed_by=item.reviewed_by,
        reviewed_by_name=_admin_name(current_admin),
        reviewed_at=item.reviewed_at,
    )


# --------------------------------------------------------------------------
# POST finalize
# --------------------------------------------------------------------------

async def finalize_review(
    db: AsyncSession,
    service_id: int,
    payload: ReviewFinalizeRequest,
    current_admin: dict,
) -> ReviewFinalizeResponse:
    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    version = service.current_draft_version
    if not version:
        raise HTTPException(status_code=409, detail="No draft version found.")

    # Concurrency: lock the version row for the duration of this transaction
    # and re-check its status. If another reviewer already finalized it,
    # this returns 409 instead of silently double-processing.
    locked = await db.execute(
        select(ServiceVersion)
        .where(ServiceVersion.id == version.id)
        .with_for_update()
    )
    version = locked.scalar_one_or_none()
    if version is None or version.status != "under_review":
        raise HTTPException(
            status_code=409,
            detail="This version was already reviewed or changed by another reviewer. "
            "Please refresh.",
        )

    items_result = await db.execute(
        select(ServiceVersionReviewItem).where(
            ServiceVersionReviewItem.service_version_id == version.id
        )
    )
    items = items_result.scalars().all()
    applicable = {s.value for s in get_applicable_sections(service, version)}
    relevant_items = [i for i in items if i.section in applicable]

    now = _utcnow()
    admin_id = current_admin["id"]
    is_update = bool(
        service.current_live_version_id
        and service.current_live_version_id != version.id
    )
    old_data = {"version_status": version.status, "service_status": service.status}

    if payload.action == ReviewFinalizeAction.approve:
        unreviewed = [i for i in relevant_items if i.status == "pending"]
        blocked = [i for i in relevant_items if i.status == "changes_requested"]
        if unreviewed or blocked:
            raise HTTPException(
                status_code=409,
                detail="Cannot approve: all sections must be reviewed and none may "
                "have changes requested.",
            )

        if service.current_live_version and service.current_live_version.id != version.id:
            service.current_live_version.status = "archived"

        version.status = "published"
        version.approved_at = now
        version.approved_by = admin_id
        version.reviewed_at = now
        version.reviewed_by = admin_id

        service.current_live_version_id = version.id
        service.current_draft_version_id = None
        service.status = "live"
        service.is_active = True

        action_label = "approved"
        new_data = {"version_status": "published", "service_status": "live"}

    elif payload.action == ReviewFinalizeAction.request_changes:
        requested = [i for i in relevant_items if i.status == "changes_requested"]
        if not requested:
            raise HTTPException(
                status_code=409,
                detail="At least one section must have changes requested.",
            )
        missing_comment = [i for i in requested if not i.comment or not i.comment.strip()]
        if missing_comment:
            raise HTTPException(
                status_code=409,
                detail="Every section with changes requested must have a comment.",
            )

        version.status = "needs_revision"
        version.rejected_at = now  # reused field, consistent with existing code
        version.rejected_by = admin_id
        version.rejection_reason = payload.final_comment
        version.reviewed_at = now
        version.reviewed_by = admin_id

        # CRITICAL: do not touch service.status if this is an update to an
        # already-live service -- Version 1 must stay visible to customers.
        if not is_update:
            service.status = "needs_revision"

        action_label = "needs_revision"
        new_data = {
            "version_status": "needs_revision",
            "service_status": service.status,
        }

    elif payload.action == ReviewFinalizeAction.reject:
        version.status = "rejected"
        version.rejected_at = now
        version.rejected_by = admin_id
        version.rejection_reason = payload.final_comment
        version.reviewed_at = now
        version.reviewed_by = admin_id

        # Rejected draft is terminal -- clear the pointer so the vendor
        # starts a fresh draft rather than editing a dead version.
        if service.current_draft_version_id == version.id:
            service.current_draft_version_id = None

        # Never unpublish an existing live version on reject.
        if not is_update:
            service.status = "rejected"

        action_label = "rejected"
        new_data = {"version_status": "rejected", "service_status": service.status}

    else:
        raise HTTPException(status_code=422, detail="Unknown action.")

    await write_version_audit(
        db,
        version_id=version.id,
        action=action_label,
        performed_by=admin_id,
        old_data=old_data,
        new_data=new_data,
    )

    await db.commit()

    return ReviewFinalizeResponse(
        message=f"Service {action_label} successfully",
        service_id=service.id,
        version_id=version.id,
        version_status=version.status,
        service_status=service.status,
    )


# --------------------------------------------------------------------------
# Review history (read-only)
# --------------------------------------------------------------------------

async def get_review_history(db: AsyncSession, service_id: int) -> ReviewHistoryResponse:
    result = await db.execute(
        select(ServiceVersion)
        .where(ServiceVersion.service_id == service_id)
        .order_by(ServiceVersion.version_number.desc())
    )
    versions = result.scalars().all()

    entries: List[ReviewHistoryVersionEntry] = []
    for v in versions:
        if v.status == "draft":
            continue  # never-submitted drafts have no review history worth showing

        items_result = await db.execute(
            select(ServiceVersionReviewItem)
            .where(ServiceVersionReviewItem.service_version_id == v.id)
            .order_by(ServiceVersionReviewItem.id)
        )
        items = items_result.scalars().all()

        entries.append(
            ReviewHistoryVersionEntry(
                version_id=v.id,
                version_number=getattr(v, "version_number", None),
                version_status=v.status,
                reviewed_at=v.reviewed_at,
                reviewed_by_name=None,  # populate via a join/loader in your real impl
                sections=[
                    SectionReviewResponse(
                        section=ReviewSectionEnum(i.section),
                        status=i.status,
                        comment=i.comment,
                        reviewed_by=i.reviewed_by,
                        reviewed_at=i.reviewed_at,
                    )
                    for i in items
                ],
                final_comment=v.rejection_reason,
            )
        )

    return ReviewHistoryResponse(service_id=service_id, versions=entries)
