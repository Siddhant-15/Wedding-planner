"""
app/controller/Admin/admin_service_controller.py

Admin service review / approval business logic.

Approval workflow:
  Vendor submits draft
      → version.status = under_review
      → service.status = under_review

  Admin approves
      → version.status = published
      → service.current_live_version_id = version.id
      → service.current_draft_version_id = NULL
      → service.status = live
      → old live version archived

  Admin rejects
      → version.status = rejected
      → service.status = draft  (vendor can re-edit)

  Vendor re-edits after rejection / on existing live service
      → new ServiceVersion created (handled in vendor controller)
      → service.current_draft_version_id = new_version.id

  Vendor re-submits
      → new version.status = under_review
      → service.status = under_review
"""
import logging
import math
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.admin.admin_repository import (
    get_all_services_paginated,
    get_dashboard_stats,
    get_service_for_review,
    get_services_under_review_paginated,
    get_version_by_id,
    write_version_audit,
    update_service_status
)

from app.schemas.admin.service_review import ServiceStatus
from app.schemas.admin.service_review import (
    AdminDashboardStats,
    PaginatedServiceReviews,
    ReviewAction,
    ServiceReviewActionRequest,
    ServiceReviewActionResponse,
    ServiceReviewDetailResponse,
    AdminServiceCard,
)
from app.utils.admin.service_review_helpers import (
    build_review_detail,
    build_service_card
)

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

async def get_dashboard_controller(db) -> AdminDashboardStats:
    stats = await get_dashboard_stats(db)
    return AdminDashboardStats(**stats)


# ---------------------------------------------------------------------------
# Service listing (all services — admin oversight view)
# ---------------------------------------------------------------------------

async def list_all_services_controller(
    db,
    page: int,
    page_size: int,
    search: str | None,
    service_type: str | None,
    service_status: str | None,
    vendor_id: int | None,
) -> PaginatedServiceReviews:
    services, total = await get_all_services_paginated(
        db,
        page=page,
        page_size=page_size,
        search=search,
        service_type=service_type,
        service_status=service_status,
        vendor_id=vendor_id,
    )

    items = [
        AdminServiceCard(**build_service_card(s))
        for s in services
    ]
    total_pages = math.ceil(total / page_size) if page_size else 1

    return PaginatedServiceReviews(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ---------------------------------------------------------------------------
# Review queue (services with under_review versions)
# ---------------------------------------------------------------------------

async def list_review_queue_controller(
    db,
    page: int,
    page_size: int,
    service_type: str | None,
    version_status: str | None,
) -> PaginatedServiceReviews:
    services, total = await get_services_under_review_paginated(
        db,
        page=page,
        page_size=page_size,
        service_type=service_type,
        version_status=version_status,
    )

    items = [AdminServiceCard(**build_review_list_item(s)) for s in services]
    total_pages = math.ceil(total / page_size) if page_size else 1

    return PaginatedServiceReviews(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ---------------------------------------------------------------------------
# Service detail
# ---------------------------------------------------------------------------

async def get_service_review_detail_controller(
    service_id: int,
    db,
) -> ServiceReviewDetailResponse:
    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return ServiceReviewDetailResponse(**build_review_detail(service))


async def update_service_status_controller(
    service_id: int,
    status: ServiceStatus,
    db: AsyncSession,
):
    service = await update_service_status(
        db=db,
        service_id=service_id,
        status=status,
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    await db.commit()

    return status



# ---------------------------------------------------------------------------
# Approve / Reject
# ---------------------------------------------------------------------------

async def review_service_controller(
    service_id: int,
    body: ServiceReviewActionRequest,
    current_admin: dict,
    db,
) -> ServiceReviewActionResponse:
    """
    Handles Approve, Reject, and Request Changes for services.
    """
    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    version = service.current_draft_version
    if not version:
        raise HTTPException(
            status_code=409,
            detail="No draft version found for this service.",
        )

    if version.status != "under_review":
        raise HTTPException(
            status_code=409,
            detail=f"Version is in '{version.status}' status. Cannot review.",
        )

    if body.action in (ReviewAction.reject, ReviewAction.request_changes) and not body.rejection_reason:
        raise HTTPException(
            status_code=422,
            detail="rejection_reason is required when rejecting or requesting changes.",
        )

    now = _utcnow()
    admin_id = current_admin["id"]

    old_data = {
        "version_status": version.status,
        "service_status": service.status,
    }

    # ── APPROVE ─────────────────────────────────────────────────────────────
    if body.action == ReviewAction.approve:
        # Archive previous live version if exists
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

    # ── REJECT ──────────────────────────────────────────────────────────────
    elif body.action == ReviewAction.reject:
        version.status = "rejected"
        version.rejected_at = now
        version.rejected_by = admin_id
        version.rejection_reason = body.rejection_reason
        version.reviewed_at = now
        version.reviewed_by = admin_id

        service.status = "draft"          # Vendor can re-submit

        action_label = "rejected"
        new_data = {"version_status": "rejected", "service_status": "draft"}

    # ── REQUEST CHANGES ─────────────────────────────────────────────────────
    elif body.action == ReviewAction.request_changes:
        version.status = "needs_revision"
        version.rejected_at = now          # Reusing field for simplicity (or create new if needed)
        version.rejected_by = admin_id
        version.rejection_reason = body.rejection_reason
        version.reviewed_at = now
        version.reviewed_by = admin_id

        service.status = "needs_revision"   # Important: Matches frontend

        action_label = "needs_revision"
        new_data = {"version_status": "needs_revision", "service_status": "needs_revision"}

    # Audit Log
    await write_version_audit(
        db,
        version_id=version.id,
        action=action_label,
        performed_by=admin_id,
        old_data=old_data,
        new_data=new_data,
    )

    await db.commit()

    logger.info(
        "Service review: service_id=%s version_id=%s action=%s admin=%s reason=%s",
        service_id, version.id, action_label, admin_id, body.rejection_reason
    )

    return ServiceReviewActionResponse(
        message=f"Service {action_label} successfully",
        service_id=service_id,
        version_id=version.id,
        version_status=version.status,
        service_status=service.status,
    )

# ---------------------------------------------------------------------------
# Admin force-submit a vendor draft for review (edge-case helper)
# ---------------------------------------------------------------------------

async def force_submit_for_review_controller(
    service_id: int,
    current_admin: dict,
    db,
) -> dict:
    """
    Allow a super_admin to push a vendor's draft into under_review
    without requiring vendor action (e.g. assisting a vendor).
    Only permitted for super_admin role.
    """
    if current_admin.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Only super_admin can force-submit")

    service = await get_service_for_review(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    version = service.current_draft_version
    if not version:
        raise HTTPException(status_code=409, detail="No draft version to submit")

    if version.status != "draft":
        raise HTTPException(
            status_code=409,
            detail=f"Version is already in '{version.status}' status",
        )

    now = _utcnow()
    version.status       = "under_review"
    version.submitted_at = now
    service.status       = "under_review"

    await write_version_audit(
        db,
        version_id=version.id,
        action="force_submitted",
        performed_by=current_admin["id"],
        old_data={"version_status": "draft"},
        new_data={"version_status": "under_review"},
    )

    await db.commit()

    return {
        "message": "Service submitted for review",
        "service_id": service_id,
        "version_id": version.id,
    }