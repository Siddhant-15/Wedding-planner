from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class UnavailableDateSchema(BaseModel):
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None

    class Config:
        from_attributes = True


class VendorCardSchema(BaseModel):
    id: int
    business_name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    experience: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    website: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== VENUE ====================
class VenueDetailSchema(BaseModel):
    venue_type: str
    venue_nature: str
    max_capacity: int
    min_capacity: int
    square_feet: float
    parking_capacity: Optional[int] = 0
    venue_policies: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ==================== SERVICE TYPE SPECIFIC DETAILS ====================

class CateringDetailSchema(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    meal_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    non_veg_price_per_head: Optional[float] = None
    min_order: int
    max_order: Optional[int] = None
    service_styles: List[str] = Field(default_factory=list)
    staff_included: bool = True
    crockery_cutlery_included: bool = True
    tasting_available: bool = False
    special_diets_supported: List[str] = Field(default_factory=list)
    customizable_menu: bool = True
    gst_percentage: float = 5.0

    class Config:
        from_attributes = True


class DjDetailSchema(BaseModel):
    genres_supported: List[str] = Field(default_factory=list)
    languages_supported: List[str] = Field(default_factory=list)
    event_types_supported: List[str] = Field(default_factory=list)
    performance_duration_hours: float
    equipments_provided: List[str] = Field(default_factory=list)
    sound_system_included: bool = True
    lighting_included: bool = False
    experience_years: int = 0

    class Config:
        from_attributes = True


class PhotographyDetailSchema(BaseModel):
    photography_types: List[str] = Field(default_factory=list)
    videography_available: bool = False
    drone_shoot_available: bool = False
    edited_photos_included: bool = True
    coverage_hours: Optional[float] = None
    experience_years: int = 0

    class Config:
        from_attributes = True


class EventManagementDetailSchema(BaseModel):
    event_types_supported: List[str] = Field(default_factory=list)
    services_offered: List[str] = Field(default_factory=list)
    themes_supported: List[str] = Field(default_factory=list)
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    experience_years: int = 0

    class Config:
        from_attributes = True


class MakeupArtistDetailSchema(BaseModel):
    makeup_types: List[str] = Field(default_factory=list)
    specialization: List[str] = Field(default_factory=list)
    brands_used: List[str] = Field(default_factory=list)
    experience_years: int = 0
    trial_available: bool = False

    class Config:
        from_attributes = True


# ==================== VARIANT ====================
class ServiceVariantDetailSchema(BaseModel):
    id: int
    variant_name: str
    description: Optional[str] = None
    min_quantity: Optional[int] = None
    max_quantity: Optional[int] = None
    pricing_type: str
    currency: str = "INR"
    pricing: Dict[str, Any]
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ==================== SERVICE CARD (List View) ====================
class ServiceCardSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    area: str = ""
    city: Optional[str] = None
    state: Optional[str] = None
    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    country: Optional[str] = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vendor_name: str
    vendor_id: str
    service_type: str
    venue: Optional[VenueDetailSchema] = None
    variants: List[ServiceVariantDetailSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ==================== SERVICE DETAIL (Full View) ====================
class ServiceDetailResponse(ServiceCardSchema):
    long_description: Optional[str] = None
    pincode: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    featured: bool = False
    created_at: datetime
    updated_at: datetime

    # Vendor full info
    vendor: VendorCardSchema

    # Service-type specific details
    catering: Optional[CateringDetailSchema] = None
    dj: Optional[DjDetailSchema] = None
    photography: Optional[PhotographyDetailSchema] = None
    event_management: Optional[EventManagementDetailSchema] = None
    makeup_artist: Optional[MakeupArtistDetailSchema] = None

    unavailable_dates: List[UnavailableDateSchema] = Field(default_factory=list)
    user_role: Optional[str] = None

    class Config:
        from_attributes = True