"""
app/schemas/admin/vendor.py

Pydantic schemas for admin-facing vendor management endpoints.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# ENUMS
# =============================================================================

class VendorVerificationStatus(str, enum.Enum):
    pending   = "pending"
    verified  = "verified"
    rejected  = "rejected"
    suspended = "suspended"


# =============================================================================
# KYC
# =============================================================================

class VendorKYCResponse(BaseModel):
    id:                           int
    vendor_id:                    int
    pan_number:                   Optional[str] = None
    gst_number:                   Optional[str] = None
    business_registration_number: Optional[str] = None
    aadhaar_last4:                Optional[str] = None
    verification_status:          str
    verified_at:                  Optional[datetime] = None
    verified_by:                  Optional[int]      = None
    rejection_reason:             Optional[str]      = None
    created_at:                   datetime
    updated_at:                   datetime

    model_config = {"from_attributes": True}


# =============================================================================
# SUBSCRIPTION CONTEXT
# =============================================================================

class VendorSubscriptionSummary(BaseModel):
    id:              int
    subscription_id: int
    subscription_name: Optional[str] = None
    status:          str
    started_at:      datetime
    expires_at:      Optional[datetime] = None

    model_config = {"from_attributes": True}


# =============================================================================
# VENDOR LIST ITEM  (lightweight — for listing page)
# =============================================================================

class VendorListItem(BaseModel):
    id:                  int
    email:               str
    first_name:          str
    last_name:           str
    business_name:       str
    city:                Optional[str] = None
    state:               Optional[str] = None
    phone:               Optional[str] = None
    verification_status: str
    total_services:      int  = 0
    created_at:          datetime
    deleted_at:          Optional[datetime] = None

    model_config = {"from_attributes": True}


# =============================================================================
# VENDOR DETAIL  (full — for detail / review page)
# =============================================================================

class VendorDetailResponse(BaseModel):
    id:                   int
    email:                str
    first_name:           str
    last_name:            str
    phone:                Optional[str] = None
    avatar:               Optional[str] = None

    add_line1:            Optional[str] = None
    add_line2:            Optional[str] = None
    city:                 Optional[str] = None
    state:                Optional[str] = None
    country:              str
    pincode:              Optional[str] = None

    verification_status:  str
    business_name:        str
    business_description: Optional[str] = None
    experience_years:     int
    contact_person:       Optional[str] = None
    website:              Optional[str] = None

    created_at:           datetime
    updated_at:           datetime
    last_login:           Optional[datetime] = None
    deleted_at:           Optional[datetime] = None

    kyc:                  Optional[VendorKYCResponse]        = None
    active_subscription:  Optional[VendorSubscriptionSummary] = None

    # Aggregated counts
    total_services:       int = 0
    live_services:        int = 0
    pending_services:     int = 0

    model_config = {"from_attributes": True}


# =============================================================================
# VENDOR VERIFICATION ACTION
# =============================================================================

class VendorVerifyRequest(BaseModel):
    """Body for PATCH /admin/vendors/{id}/verify"""
    action:           VendorVerificationStatus
    rejection_reason: Optional[str] = Field(
        None,
        description="Required when action is 'rejected' or 'suspended'",
    )


# =============================================================================
# PAGINATION WRAPPER
# =============================================================================

class PaginatedVendors(BaseModel):
    items:      List[VendorListItem]
    total:      int
    page:       int
    page_size:  int
    total_pages: int