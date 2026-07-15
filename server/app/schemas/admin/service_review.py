"""
app/schemas/admin/service_review.py

Pydantic schemas for admin service review / approval workflow.

Lifecycle:
  Vendor submits draft → status = under_review
  Admin approves       → status = published  (service.status → live)
  Admin rejects        → status = rejected
  Vendor re-edits      → new draft version created
  Vendor re-submits    → status = under_review  (again)
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# =============================================================================
# ENUMS
# =============================================================================

class ReviewAction(str, enum.Enum):
    approve = "approve"
    reject  = "reject"
    request_changes = "request_changes"
    # needs_revision = "needs_revision"


# =============================================================================
# SERVICE VERSION SUMMARY  (used inside list views)
# =============================================================================

class ServiceVersionSummary(BaseModel):
    version_id:      int
    version_number:  int
    version_status:  str
    service_name:    str
    city:            Optional[str] = None
    state:           Optional[str] = None
    submitted_at:    Optional[datetime] = None
    reviewed_at:     Optional[datetime] = None
    approved_at:     Optional[datetime] = None
    rejected_at:     Optional[datetime] = None
    rejection_reason: Optional[str] = None

    model_config = {"from_attributes": True}


# =============================================================================
# SERVICE LIST ITEM  (lightweight — for queue / listing)
# =============================================================================

class AdminServiceCard(BaseModel):
    id: int

    name: Optional[str] = None

    category: str

    vendor: str

    city: Optional[str] = None

    price: Optional[float] = None

    status: str

    createdAt: datetime

    images: List[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}




# =============================================================================
# FULL SERVICE DETAIL  (for admin review page — mirrors vendor ServiceResponse)
# =============================================================================

class ServiceReviewDetailResponse(BaseModel):
    """
    Complete service detail for the admin review page.
    Shape intentionally matches the vendor-facing ServiceResponse so the
    admin frontend can reuse the same rendering components.
    """
    # Service-level
    service_id:     int
    vendor_id:      int
    service_type:   str
    service_status: str
    is_active:      bool
    created_at:     datetime

    # Vendor snapshot
    vendor_name:    str
    vendor_email:   str
    vendor_phone:   Optional[str] = None

    # Active version fields (flattened)
    version_id:      Optional[int]      = None
    version_number:  Optional[int]      = None
    version_status:  Optional[str]      = None
    service_name:    Optional[str]      = None
    description:     Optional[str]      = None
    add_line1:       Optional[str]      = None
    add_line2:       Optional[str]      = None
    area:            Optional[str]      = None
    city:            Optional[str]      = None
    state:           Optional[str]      = None
    country:         str                = "India"
    pincode:         Optional[str]      = None
    latitude:        Optional[float]    = None
    longitude:       Optional[float]    = None
    metadata:        Dict[str, Any]     = Field(default_factory=dict)

    submitted_at:    Optional[datetime] = None
    reviewed_at:     Optional[datetime] = None
    reviewed_by:     Optional[int]      = None
    approved_at:     Optional[datetime] = None
    approved_by:     Optional[int]      = None
    rejected_at:     Optional[datetime] = None
    rejected_by:     Optional[int]      = None
    rejection_reason: Optional[str]     = None

    # Type-specific detail blocks (exactly one non-null)
    venue:            Optional[Dict[str, Any]] = None
    catering:         Optional[Dict[str, Any]] = None
    dj:               Optional[Dict[str, Any]] = None
    photography:      Optional[Dict[str, Any]] = None
    event_management: Optional[Dict[str, Any]] = None
    makeup_artist:    Optional[Dict[str, Any]] = None

    variants:          List[Dict[str, Any]] = Field(default_factory=list)
    media:             List[Dict[str, Any]] = Field(default_factory=list)

    # Version history (all versions for this service, latest first)
    version_history:   List[ServiceVersionSummary] = Field(default_factory=list)

    model_config = {"from_attributes": True}

class AdminServiceDetail(BaseModel):
    service: Dict[str, Any]

    vendor: Dict[str, Any]

    version: Dict[str, Any]

    media: List[Dict[str, Any]] = Field(default_factory=list)

    variants: List[Dict[str, Any]] = Field(default_factory=list)

    venue: Optional[Dict[str, Any]] = None

    catering: Optional[Dict[str, Any]] = None

    dj: Optional[Dict[str, Any]] = None

    photography: Optional[Dict[str, Any]] = None

    event_management: Optional[Dict[str, Any]] = None

    makeup_artist: Optional[Dict[str, Any]] = None

    version_history: List[ServiceVersionSummary] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# =============================================================================
# REVIEW ACTION REQUEST / RESPONSE
# =============================================================================

class ServiceReviewActionRequest(BaseModel):
    action: ReviewAction
    rejection_reason: Optional[str] = Field(
        None,
        description="Required when action is 'reject' or 'request_changes'",
    )
    notes: Optional[str] = None


class ServiceReviewActionResponse(BaseModel):
    message:        str
    service_id:     int
    version_id:     int
    version_status: str
    service_status: str


# =============================================================================
# PAGINATION WRAPPER
# =============================================================================

class PaginatedServiceReviews(BaseModel):
    items:       List[AdminServiceCard]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


# =============================================================================
# DASHBOARD STATS
# =============================================================================

class AdminDashboardStats(BaseModel):
    total_vendors:          int
    pending_vendors:        int
    verified_vendors:       int
    total_services:         int
    services_under_review:  int
    services_live:          int
    services_rejected:      int
    total_leads:            int
    total_bookings:         int

class ServiceStatus(str, enum.Enum):
    draft        = "draft"
    under_review = "under_review"
    approved     = "approved"
    published    = "published"
    rejected     = "rejected"
    archived     = "archived"
    needs_revision = "needs_revision"

class UpdateServiceStatusRequest(BaseModel):
    status: ServiceStatus