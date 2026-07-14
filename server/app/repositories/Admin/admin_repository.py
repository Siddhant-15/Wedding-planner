"""
app/repositories/Admin/admin_repository.py

All raw DB queries for the admin module.
No business logic here — pure data access.
"""

from __future__ import annotations

import logging
from typing import List, Optional, Tuple

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.models import (
    Admin,
    Booking,
    Lead,
    Service,
    ServiceVersion,
    ServiceVersionAudit,
    Subscription,
    Vendor,
    VendorKYC,
    VendorSubscription,
)
from app.schemas.Admin.service_review import ServiceStatus

logger = logging.getLogger(__name__)


# =============================================================================
# ADMIN AUTH
# =============================================================================

async def get_admin_by_email(
    db: AsyncSession,
    email: str,
) -> Optional[Admin]:
    result = await db.execute(
        select(Admin).where(
            Admin.email == email,
            Admin.is_active == True,        # noqa: E712
            Admin.deleted_at.is_(None),
        )
    )
    return result.scalar_one_or_none()

async def create_admin(
    db,
    email: str,
    hashed_password: str,
    role: str,
    first_name: str,
    last_name: str
):
    admin = Admin(
        email=email,
        hashed_password=hashed_password,
        role=role,
        first_name=first_name,
        last_name=last_name
    )

    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    return admin


async def get_admin_by_id(
    db: AsyncSession,
    admin_id: int,
) -> Optional[Admin]:
    result = await db.execute(
        select(Admin).where(
            Admin.id == admin_id,
            Admin.is_active == True,        # noqa: E712
            Admin.deleted_at.is_(None),
        )
    )
    return result.scalar_one_or_none()


# =============================================================================
# VENDOR QUERIES
# =============================================================================

async def get_vendors_paginated(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    verification_status: Optional[str] = None,
    include_deleted: bool = False,
) -> Tuple[List[Vendor], int]:
    """
    Return (vendors, total_count) with optional search and status filter.
    Eager-loads kyc and subscriptions for the list view.
    """
    base_query = select(Vendor)

    conditions = []
    if not include_deleted:
        conditions.append(Vendor.deleted_at.is_(None))

    if search:
        term = f"%{search.strip()}%"
        conditions.append(
            or_(
                Vendor.email.ilike(term),
                Vendor.business_name.ilike(term),
                Vendor.first_name.ilike(term),
                Vendor.last_name.ilike(term),
                Vendor.city.ilike(term),
            )
        )

    if verification_status:
        conditions.append(Vendor.verification_status == verification_status)

    if conditions:
        base_query = base_query.where(*conditions)

    # Total count (no pagination options applied)
    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar_one()

    # Paginated data
    offset = (page - 1) * page_size
    result = await db.execute(
        base_query
        .order_by(Vendor.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    vendors = result.scalars().unique().all()

    return list(vendors), total


async def get_vendor_detail(
    db: AsyncSession,
    vendor_id: int,
) -> Optional[Vendor]:
    """Full vendor detail with KYC + active subscription."""
    result = await db.execute(
        select(Vendor)
        .where(Vendor.id == vendor_id)
        .options(
            joinedload(Vendor.kyc),
            joinedload(Vendor.subscriptions).joinedload(VendorSubscription.subscription),
        )
    )
    return result.unique().scalar_one_or_none()


async def count_vendor_services(
    db: AsyncSession,
    vendor_id: int,
) -> Tuple[int, int, int]:
    """Return (total, live, pending_review) service counts for a vendor."""
    all_q = await db.execute(
        select(func.count(Service.id)).where(
            Service.vendor_id == vendor_id,
            Service.deleted_at.is_(None),
        )
    )
    total = all_q.scalar_one()

    live_q = await db.execute(
        select(func.count(Service.id)).where(
            Service.vendor_id == vendor_id,
            Service.status == "live",
            Service.deleted_at.is_(None),
        )
    )
    live = live_q.scalar_one()

    pending_q = await db.execute(
        select(func.count(Service.id)).where(
            Service.vendor_id == vendor_id,
            Service.status == "under_review",
            Service.deleted_at.is_(None),
        )
    )
    pending = pending_q.scalar_one()

    return total, live, pending


async def set_vendor_verification_status(
    db: AsyncSession,
    vendor_id: int,
    status: str,
) -> Optional[Vendor]:
    """Update vendor.verification_status and return the updated row."""
    await db.execute(
        update(Vendor)
        .where(Vendor.id == vendor_id)
        .values(verification_status=status)
    )
    await db.flush()
    return await get_vendor_detail(db, vendor_id)


# =============================================================================
# SERVICE REVIEW QUEUE
# =============================================================================

def _review_service_opts() -> list:
    """
    Eager-load options for admin service review queries.
    Loads the current_draft_version (submitted for review) and its children.
    Also loads current_live_version so we can diff if needed.
    """
    def _version_children(version_attr):
        return [
            joinedload(version_attr).joinedload(ServiceVersion.venue_detail),
            joinedload(version_attr).joinedload(ServiceVersion.catering_detail),
            joinedload(version_attr).joinedload(ServiceVersion.dj_detail),
            joinedload(version_attr).joinedload(ServiceVersion.photography_detail),
            joinedload(version_attr).joinedload(ServiceVersion.event_management_detail),
            joinedload(version_attr).joinedload(ServiceVersion.makeup_artist_detail),
            joinedload(version_attr).selectinload(ServiceVersion.variants),
            joinedload(version_attr).selectinload(ServiceVersion.media),
        ]

    return [
        joinedload(Service.vendor),
        joinedload(Service.current_draft_version),
        joinedload(Service.current_live_version),
        selectinload(Service.versions),   # for version history
        *_version_children(Service.current_draft_version),
        *_version_children(Service.current_live_version),
    ]


async def get_services_under_review_paginated(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    service_type: Optional[str] = None,
    version_status: Optional[str] = None,
) -> Tuple[List[Service], int]:
    """
    Return services that have a version in under_review (or any status filter).
    Joined on service_versions to filter by version status.
    """
    # Default: show services whose draft version is under_review
    target_status = version_status or "under_review"

    subq = (
        select(ServiceVersion.service_id)
        .where(ServiceVersion.status == target_status)
        .subquery()
    )

    base = (
        select(Service)
        .where(
            Service.id.in_(select(subq.c.service_id)),
            Service.deleted_at.is_(None),
        )
    )

    if service_type:
        base = base.where(Service.service_type == service_type)

    count_result = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_result.scalar_one()

    offset = (page - 1) * page_size
    result = await db.execute(
        base
        .options(*_review_service_opts())
        .order_by(Service.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    services = result.scalars().unique().all()

    return list(services), total


async def get_service_for_review(
    db: AsyncSession,
    service_id: int,
) -> Optional[Service]:
    """Full service detail for the admin review page."""
    result = await db.execute(
        select(Service)
        .where(
            Service.id == service_id,
            Service.deleted_at.is_(None),
        )
        .options(*_review_service_opts())
    )
    return result.unique().scalar_one_or_none()

async def update_service_status(
    db: AsyncSession,
    service_id: int,
    status: ServiceStatus,
) -> Optional[ServiceVersion]:
    """Update service status and return updated service."""

    await db.execute(
        update(ServiceVersion)
        .where(Service.id == service_id)
        .values(status=status)
    )

    await db.flush()

    return await get_service_for_review(db, service_id)


async def get_all_services_paginated(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    service_type: Optional[str] = None,
    service_status: Optional[str] = None,
    vendor_id: Optional[int] = None,
) -> Tuple[List[Service], int]:
    """Admin 'all services' view with filters."""

    base = select(Service).where(Service.deleted_at.is_(None))

    if vendor_id:
        base = base.where(Service.vendor_id == vendor_id)

    if service_type:
        base = base.where(Service.service_type == service_type)

    # Filter using status from ServiceVersion
    if service_status:
        base = (
            base.join(
                ServiceVersion,
                Service.current_live_version_id == ServiceVersion.id,
            )
            .where(ServiceVersion.status == service_status)
        )

    if search:
        term = f"%{search.strip()}%"
        version_subq = (
            select(ServiceVersion.service_id)
            .where(
                or_(
                    ServiceVersion.service_name.ilike(term),
                    ServiceVersion.city.ilike(term),
                )
            )
            .subquery()
        )
        base = base.where(Service.id.in_(select(version_subq.c.service_id)))

    count_result = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_result.scalar_one()

    offset = (page - 1) * page_size

    result = await db.execute(
        base.options(
            joinedload(Service.vendor),
            joinedload(Service.current_draft_version)
                .selectinload(ServiceVersion.media),
            joinedload(Service.current_live_version)
                .selectinload(ServiceVersion.media),
        )
        .order_by(Service.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    services = result.scalars().unique().all()

    return list(services), total

# =============================================================================
# VERSION OPERATIONS
# =============================================================================

async def get_version_by_id(
    db: AsyncSession,
    version_id: int,
) -> Optional[ServiceVersion]:
    result = await db.execute(
        select(ServiceVersion).where(ServiceVersion.id == version_id)
    )
    return result.scalar_one_or_none()


async def write_version_audit(
    db: AsyncSession,
    version_id: int,
    action: str,
    performed_by: int,
    old_data: Optional[dict] = None,
    new_data: Optional[dict] = None,
) -> None:
    """Insert a service_version_audit row."""
    db.add(ServiceVersionAudit(
        service_version_id=version_id,
        action=action,
        performed_by=performed_by,
        performed_by_type="admin",
        old_data=old_data,
        new_data=new_data,
    ))
    await db.flush()


# =============================================================================
# DASHBOARD STATS
# =============================================================================

async def get_dashboard_stats(db: AsyncSession) -> dict:
    async def _count(stmt) -> int:
        r = await db.execute(stmt)
        return r.scalar_one()

    total_vendors    = await _count(select(func.count(Vendor.id)).where(Vendor.deleted_at.is_(None)))
    pending_vendors  = await _count(select(func.count(Vendor.id)).where(Vendor.verification_status == "pending", Vendor.deleted_at.is_(None)))
    verified_vendors = await _count(select(func.count(Vendor.id)).where(Vendor.verification_status == "verified", Vendor.deleted_at.is_(None)))
    total_services   = await _count(select(func.count(Service.id)).where(Service.deleted_at.is_(None)))

    # services with at least one under_review version
    review_subq = select(ServiceVersion.service_id).where(ServiceVersion.status == "under_review").subquery()
    under_review = await _count(select(func.count()).select_from(
        select(Service.id).where(Service.id.in_(select(review_subq.c.service_id))).subquery()
    ))

    live_services     = await _count(select(func.count(Service.id)).where(Service.status == "live", Service.deleted_at.is_(None)))
    rejected_services = await _count(select(func.count(Service.id)).where(Service.status == "inactive", Service.deleted_at.is_(None)))
    total_leads       = await _count(select(func.count(Lead.id)))
    total_bookings    = await _count(select(func.count(Booking.id)))

    return {
        "total_vendors":         total_vendors,
        "pending_vendors":       pending_vendors,
        "verified_vendors":      verified_vendors,
        "total_services":        total_services,
        "services_under_review": under_review,
        "services_live":         live_services,
        "services_rejected":     rejected_services,
        "total_leads":           total_leads,
        "total_bookings":        total_bookings,
    }