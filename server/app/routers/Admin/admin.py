"""
app/routers/admin.py

All admin-facing routes.

Route map:
  POST   /admin/auth/login                           → login
  POST   /admin/auth/refresh                         → refresh access token
  POST   /admin/auth/change-password                 → change own password

  GET    /admin/dashboard                            → stats overview

  GET    /admin/vendors                              → paginated vendor list
  GET    /admin/vendors/{vendor_id}                  → vendor detail + KYC + services
  PATCH  /admin/vendors/{vendor_id}/verify           → approve / reject / suspend vendor

  GET    /admin/services                             → all services (admin overview)
  GET    /admin/services/review-queue                → services awaiting review
  GET    /admin/services/{service_id}                → full service detail for review
  POST   /admin/services/{service_id}/review         → approve or reject a version
  POST   /admin/services/{service_id}/force-submit   → super_admin: push draft → under_review
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.adminauth import (
    get_current_admin,
    require_reviewer_or_above,
    require_super_admin,
)
from app.models.models import ServiceVersionStatusEnum
from app.controller.admin.admin_auth_controller import (
    admin_change_password_controller,
    admin_login_controller,
    admin_refresh_controller,
    admin_signup_controller
)
from app.controller.admin.admin_service_controller import (
    force_submit_for_review_controller,
    get_dashboard_controller,
    get_service_review_detail_controller,
    list_all_services_controller,
    list_review_queue_controller,
    review_service_controller,
    update_service_status_controller
)
from app.controller.admin.admin_vendor_controller import (
    get_vendor_detail_controller,
    list_vendors_controller,
    verify_vendor_controller,
)
from app.schemas.admin.auth import AdminLogin, AdminPasswordChange, AdminToken, AdminSignup
from app.schemas.admin.service_review import (
    AdminDashboardStats,
    PaginatedServiceReviews,
    ServiceReviewActionRequest,
    ServiceReviewActionResponse,
    ServiceReviewDetailResponse,
    UpdateServiceStatusRequest
)
from app.schemas.admin.vendor import (
    PaginatedVendors,
    VendorDetailResponse,
    VendorVerifyRequest,
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])


# =============================================================================
# AUTH
# =============================================================================

@admin_router.post(
    "/auth/signup",
    response_model=AdminToken,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    data: AdminSignup,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await admin_signup_controller(
        data=data,
        db=db,
        response=response,
    )

@admin_router.post(
    "/auth/login",
    response_model=AdminToken,
    summary="Admin login — returns access token + sets refresh cookie",
)
async def admin_login(
    data: AdminLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await admin_login_controller(data, db, response)


@admin_router.post(
    "/auth/refresh",
    summary="Refresh admin access token using the refresh cookie",
)
async def admin_refresh(request: Request):
    return await admin_refresh_controller(request)


@admin_router.post(
    "/auth/change-password",
    summary="Change own admin password",
)
async def admin_change_password(
    data: AdminPasswordChange,
    db: AsyncSession          = Depends(get_db),
    current_admin: dict       = Depends(get_current_admin),
):
    return await admin_change_password_controller(data, current_admin, db)


# =============================================================================
# DASHBOARD
# =============================================================================

@admin_router.get(
    "/dashboard",
    response_model=AdminDashboardStats,
    summary="Platform overview stats",
)
async def admin_dashboard(
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await get_dashboard_controller(db)


# =============================================================================
# VENDORS
# =============================================================================

@admin_router.get(
    "/vendors",
    response_model=PaginatedVendors,
    summary="List all vendors with optional search and status filter",
)
async def list_vendors(
    page:                int            = 1,
    page_size:           int            = 20,
    search:              Optional[str]  = None,
    verification_status: Optional[str]  = None,
    include_deleted:     bool           = False,
    db: AsyncSession                    = Depends(get_db),
    current_admin: dict                 = Depends(get_current_admin),
):
    return await list_vendors_controller(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        verification_status=verification_status,
        include_deleted=include_deleted,
    )


@admin_router.get(
    "/vendors/{vendor_id}",
    response_model=VendorDetailResponse,
    summary="Full vendor profile: KYC, subscription, service stats",
)
async def get_vendor(
    vendor_id: int,
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await get_vendor_detail_controller(vendor_id, db)


@admin_router.patch(
    "/vendors/{vendor_id}/verify",
    summary="Approve / reject / suspend a vendor",
)
async def verify_vendor(
    vendor_id: int,
    body: VendorVerifyRequest,
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await verify_vendor_controller(vendor_id, body, current_admin, db)


# =============================================================================
# SERVICES — OVERVIEW
# =============================================================================

@admin_router.get(
    "/services",
    response_model=PaginatedServiceReviews,
    summary="All services (admin oversight) — filter by type, status, vendor",
)
async def list_all_services(
    page:           int           = 1,
    page_size:      int           = 20,
    search:         Optional[str] = None,
    service_type:   Optional[str] = None,
    service_status: Optional[str] = None,
    vendor_id:      Optional[int] = None,
    db: AsyncSession              = Depends(get_db),
    current_admin: dict           = Depends(get_current_admin),
):
    return await list_all_services_controller(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        service_type=service_type,
        service_status=service_status,
        vendor_id=vendor_id,
    )


# =============================================================================
# SERVICES — REVIEW QUEUE
# =============================================================================

@admin_router.get(
    "/services/review-queue",
    response_model=PaginatedServiceReviews,
    summary="Services with versions awaiting review",
)
async def list_review_queue(
    page:           int           = 1,
    page_size:      int           = 20,
    service_type:   Optional[str] = None,
    version_status: Optional[str] = None,
    db: AsyncSession              = Depends(get_db),
    current_admin: dict           = Depends(get_current_admin),
):
    return await list_review_queue_controller(
        db=db,
        page=page,
        page_size=page_size,
        service_type=service_type,
        version_status=version_status,
    )


@admin_router.get(
    "/services/{service_id}",
    response_model=ServiceReviewDetailResponse,
    summary="Full service detail for admin review — includes version history",
)
async def get_service_review_detail(
    service_id: int,
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await get_service_review_detail_controller(service_id, db)

@admin_router.patch(
    "/services/{service_id}",
    response_model=ServiceVersionStatusEnum,
    summary="Update service status by admin",
)
async def update_service_status_api(
    service_id: int,
    payload: UpdateServiceStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await update_service_status_controller(
        service_id=service_id,
        status=payload.status,
        db=db,
    )


@admin_router.post(
    "/services/{service_id}/review",
    response_model=ServiceReviewActionResponse,
    summary="Approve or reject the under_review version of a service",
)
async def review_service(
    service_id: int,
    body: ServiceReviewActionRequest,
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(require_reviewer_or_above),
):
    return await review_service_controller(service_id, body, current_admin, db)


@admin_router.post(
    "/services/{service_id}/force-submit",
    summary="[super_admin only] Push a vendor draft into under_review",
)
async def force_submit_service(
    service_id: int,
    db: AsyncSession    = Depends(get_db),
    current_admin: dict = Depends(require_super_admin),
):
    return await force_submit_for_review_controller(service_id, current_admin, db)