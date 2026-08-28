# Add these routes to your existing admin router file (alongside
# update_service_status_api / review_service). Keep the old
# POST /services/{service_id}/review endpoint if you want a fallback, but
# the frontend below no longer calls it directly for structured review --
# it uses the three endpoints below instead.
#
# ADJUST imports to your actual paths.

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_db

from app.dependencies.admin_auth import get_current_admin, require_reviewer_or_above
from app.schemas.admin.schemas_review import (
    ReviewDataResponse,
    ReviewFinalizeRequest,
    ReviewFinalizeResponse,
    ReviewHistoryResponse,
    ReviewSectionEnum,
    SectionReviewResponse,
    SectionReviewUpdateRequest,
)
from app.controller.admin.review_service import get_review_data, update_review_section, finalize_review, get_review_history

admin_review_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_review_router.get(
    "/services/{service_id}/review",
    response_model=ReviewDataResponse,
    summary="Get structured review data for a service's draft version",
)
async def get_service_review_api(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await get_review_data(db, service_id)


@admin_review_router.put(
    "/services/{service_id}/review/sections/{section}",
    response_model=SectionReviewResponse,
    summary="Save a single section's review decision (autosave)",
)
async def update_review_section_api(
    service_id: int,
    section: ReviewSectionEnum,
    payload: SectionReviewUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await update_review_section(
        db, service_id, section, payload, current_admin
    )


@admin_review_router.post(
    "/services/{service_id}/review/finalize",
    response_model=ReviewFinalizeResponse,
    summary="Finalize a review: approve, request changes, or reject",
)
async def finalize_review_api(
    service_id: int,
    payload: ReviewFinalizeRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await finalize_review(db, service_id, payload, current_admin)



@admin_review_router.get(
    "/services/{service_id}/review/history",
    response_model=ReviewHistoryResponse,
    summary="Read-only review history across all versions of a service",
)
async def get_review_history_api(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await get_review_history(db, service_id)


# --------------------------------------------------------------------------
# Vendor-submission integration point
# --------------------------------------------------------------------------
# Wherever your vendor flow currently does `version.status = "under_review"`
# (submitting a draft for review), call this right after, inside the same
# transaction, before commit:
#
#   from app.services.review_service import ensure_review_items_for_version
#   await ensure_review_items_for_version(db, service, version)
#
# This is what makes review-item creation idempotent and safe on
# resubmission (a new version gets its own fresh set of pending items;
# nothing is copied from the previous version's feedback).
# --------------------------------------------------------------------------


# --------------------------------------------------------------------------
# Public/customer query guard
# --------------------------------------------------------------------------
# Wherever customer-facing service queries currently join to a version,
# make sure they filter on Service.current_live_version_id == ServiceVersion.id
# (never on status alone) -- e.g.:
#
#   select(Service, ServiceVersion)
#   .join(ServiceVersion, ServiceVersion.id == Service.current_live_version_id)
#   .where(Service.deleted_at.is_(None))
#
# A version with status="published" that ISN'T the current_live_version_id
# (this can't happen with the flow above, but guard it anyway) must never
# leak into public results -- always join through the pointer, not the enum.
# --------------------------------------------------------------------------
