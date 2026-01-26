# app/schemas/service.py

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


# ====================
# Vendor Schema
# ====================
class VendorDetailSchema(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    experience: Optional[int] = None
    city: str
    state: str

    class Config:
        from_attributes = True


# ====================
# Category-Specific Detail Schemas
# ====================

class VenueDetailSchema(BaseModel):
    capacity_min: Optional[int] = None
    capacity_max: Optional[int] = None
    hall_type: Optional[str] = None
    indoor_outdoor: Optional[str] = None
    square_feet: Optional[float] = None
    parking_capacity: Optional[int] = None
    decoration_policy: Optional[str] = None
    catering_policy: Optional[str] = None
    alcohol_policy: Optional[str] = None

    class Config:
        from_attributes = True


class CateringDetailSchema(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    nonveg_price_per_head: Optional[float] = None
    min_order: Optional[int] = None
    max_order: Optional[int] = None
    service_style: Optional[str] = None
    staff_included: Optional[bool] = True
    crockery_cutlery_included: Optional[bool] = True
    tasting_available: Optional[bool] = False

    class Config:
        from_attributes = True


class DJDetailSchema(BaseModel):
    genres_supported: List[str] = Field(default_factory=list)
    duration_hours: Optional[float] = None
    equipment: List[str] = Field(default_factory=list)
    lighting_included: Optional[bool] = False
    mc_host_available: Optional[bool] = False
    setup_time_required: Optional[float] = None

    class Config:
        from_attributes = True


class PhotographerDetailSchema(BaseModel):
    package_type: List[str] = Field(default_factory=list)
    hours_covered: Optional[float] = None
    photos_delivered: Optional[int] = None
    edited_photos_count: Optional[int] = None
    delivery_time_days: Optional[int] = None
    videography_included: Optional[bool] = False
    drone_available: Optional[bool] = False
    album_included: Optional[bool] = False

    class Config:
        from_attributes = True


class EventManagementDetailSchema(BaseModel):
    event_types: List[str] = Field(default_factory=list)
    team_size: Optional[int] = None
    includes: List[str] = Field(default_factory=list)
    package_modal: Optional[str] = None
    vendor_network_size: Optional[int] = None
    experience_years: Optional[int] = None

    class Config:
        from_attributes = True


# ====================
# Service Detail Response (Full Page)
# ====================

class ServiceDetailResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    price: Optional[float] = None
    currency: str = Field(default="INR")
    pricing_type: Optional[str] = None  # e.g., "per_day", "per_head"
    
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: int = Field(default=0, ge=0)

    city: str
    state: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    area: Optional[str] = None
    pincode: Optional[str] = None

    service_type: str  # "venue", "catering", etc.
    amenities: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    featured: bool = Field(default=False)
    verified: bool = Field(default=False)

    created_at: datetime
    updated_at: datetime

    vendor: VendorDetailSchema

    # Category-specific details — only one will be populated
    venue: Optional[VenueDetailSchema] = None
    catering: Optional[CateringDetailSchema] = None
    dj: Optional[DJDetailSchema] = None
    photographer: Optional[PhotographerDetailSchema] = None
    event_management: Optional[EventManagementDetailSchema] = None

    class Config:
        from_attributes = True
        populate_by_name = True


# ====================
# Service Card Schema (List View)
# ====================

# Reuse the same category schemas from your services module if they exist
# Otherwise define lightweight versions here

# If you already have these in app/schemas/services.py, import them:
# from app.schemas.services import (
#     VenueServiceResponse as VenueCardSchema,
#     CateringServiceResponse as CateringCardSchema,
#     ...
# )

# For consistency, here are lightweight card versions (optional)
class VenueCardSchema(BaseModel):
    capacity_min: Optional[int] = None
    capacity_max: Optional[int] = None
    hall_type: Optional[str] = None
    indoor_outdoor: Optional[str] = None
    parking_capacity: Optional[int] = None
    decoration_policy: Optional[str] = None
    catering_policy: Optional[str] = None
    alcohol_policy: Optional[str] = None

    class Config:
        from_attributes = True


class CateringCardSchema(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    nonveg_price_per_head: Optional[float] = None
    service_style: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceCardSchema(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    price: Optional[float] = None
    currency: str = "INR"
    
    rating: Optional[float] = None
    review_count: int = Field(default=0, alias="total_reviews")

    area: Optional[str] = None
    city: str
    state: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None

    vendor_name: str
    vendor_id: UUID
    service_type: str

    # Lightweight category-specific info for cards
    venue: Optional[VenueCardSchema] = None
    catering: Optional[CateringCardSchema] = None
    dj: Optional[DJDetailSchema] = None
    photographer: Optional[PhotographerDetailSchema] = None
    event_management: Optional[EventManagementDetailSchema] = None

    class Config:
        from_attributes = True
        populate_by_name = True