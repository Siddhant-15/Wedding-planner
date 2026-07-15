"""
app/controller/Admin/admin_vendor_controller.py

Admin vendor management business logic.
"""

from __future__ import annotations

import logging
import math

from fastapi import HTTPException

from app.repositories.admin.admin_repository import (
    count_vendor_services,
    get_vendor_detail,
    get_vendors_paginated,
    set_vendor_verification_status,
)
from app.schemas.admin.vendor import (
    PaginatedVendors,
    VendorDetailResponse,
    VendorListItem,
    VendorSubscriptionSummary,
    VendorVerifyRequest,
    VendorKYCResponse,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _active_subscription(vendor) -> VendorSubscriptionSummary | None:
    """Return the vendor's most-recent active subscription, if any."""
    active = [s for s in (vendor.subscriptions or []) if s.status == "active"]
    if not active:
        return None
    latest = sorted(active, key=lambda s: s.started_at, reverse=True)[0]
    return VendorSubscriptionSummary(
        id=latest.id,
        subscription_id=latest.subscription_id,
        subscription_name=latest.subscription.name if latest.subscription else None,
        status=latest.status,
        started_at=latest.started_at,
        expires_at=latest.expires_at,
    )


def _build_vendor_list_item(vendor, total_services: int = 0) -> VendorListItem:
    return VendorListItem(
        id=vendor.id,
        email=vendor.email,
        first_name=vendor.first_name,
        last_name=vendor.last_name,
        business_name=vendor.business_name,
        city=vendor.city,
        state=vendor.state,
        phone=vendor.phone,
        verification_status=vendor.verification_status,
        total_services=total_services,
        created_at=vendor.created_at,
        deleted_at=vendor.deleted_at,
    )


def _build_vendor_detail(vendor, total: int, live: int, pending: int) -> VendorDetailResponse:
    kyc_resp = None
    if vendor.kyc:
        k = vendor.kyc
        kyc_resp = VendorKYCResponse(
            id=k.id,
            vendor_id=k.vendor_id,
            pan_number=k.pan_number,
            gst_number=k.gst_number,
            business_registration_number=k.business_registration_number,
            aadhaar_last4=k.aadhaar_last4,
            verification_status=k.verification_status,
            verified_at=k.verified_at,
            verified_by=k.verified_by,
            rejection_reason=k.rejection_reason,
            created_at=k.created_at,
            updated_at=k.updated_at,
        )

    return VendorDetailResponse(
        id=vendor.id,
        email=vendor.email,
        first_name=vendor.first_name,
        last_name=vendor.last_name,
        phone=vendor.phone,
        avatar=vendor.avatar,
        add_line1=vendor.add_line1,
        add_line2=vendor.add_line2,
        city=vendor.city,
        state=vendor.state,
        country=vendor.country or "India",
        pincode=vendor.pincode,
        verification_status=vendor.verification_status,
        business_name=vendor.business_name,
        business_description=vendor.business_description,
        experience_years=vendor.experience_years or 0,
        contact_person=vendor.contact_person,
        website=vendor.website,
        created_at=vendor.created_at,
        updated_at=vendor.updated_at,
        last_login=vendor.last_login,
        deleted_at=vendor.deleted_at,
        kyc=kyc_resp,
        active_subscription=_active_subscription(vendor),
        total_services=total,
        live_services=live,
        pending_services=pending,
    )


# ---------------------------------------------------------------------------
# Controllers
# ---------------------------------------------------------------------------

async def list_vendors_controller(
    db,
    page: int,
    page_size: int,
    search: str | None,
    verification_status: str | None,
    include_deleted: bool,
) -> PaginatedVendors:
    vendors, total = await get_vendors_paginated(
        db,
        page=page,
        page_size=page_size,
        search=search,
        verification_status=verification_status,
        include_deleted=include_deleted,
    )

    items = [_build_vendor_list_item(v) for v in vendors]
    total_pages = math.ceil(total / page_size) if page_size else 1

    return PaginatedVendors(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def get_vendor_detail_controller(
    vendor_id: int,
    db,
) -> VendorDetailResponse:
    vendor = await get_vendor_detail(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    total, live, pending = await count_vendor_services(db, vendor_id)
    return _build_vendor_detail(vendor, total, live, pending)


async def verify_vendor_controller(
    vendor_id: int,
    body: VendorVerifyRequest,
    current_admin: dict,
    db,
) -> dict:
    vendor = await get_vendor_detail(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if body.action in ("rejected", "suspended") and not body.rejection_reason:
        raise HTTPException(
            status_code=422,
            detail="rejection_reason is required when action is rejected or suspended",
        )

    # Update KYC record if it exists
    if vendor.kyc:
        vendor.kyc.verification_status = body.action.value
        if body.action.value == "verified":
            from datetime import datetime, timezone
            vendor.kyc.verified_at = datetime.now(timezone.utc)
            vendor.kyc.verified_by = current_admin["id"]
            vendor.kyc.rejection_reason = None
        else:
            vendor.kyc.rejection_reason = body.rejection_reason

    await set_vendor_verification_status(db, vendor_id, body.action.value)
    await db.commit()

    logger.info(
        "Vendor verification updated: vendor_id=%s action=%s admin=%s",
        vendor_id, body.action.value, current_admin["id"],
    )

    return {
        "message": f"Vendor {body.action.value} successfully",
        "vendor_id": vendor_id,
        "verification_status": body.action.value,
    }