from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from uuid import UUID
from datetime import datetime

class ServiceCategory(str, Enum):
    VENUE = "venue"
    CATERING = "catering"
    DJ = "dj"
    EVENT_MANAGEMENT = "event_management"
    PHOTOGRAPHY = "photographer"

class PricingType(str, Enum):
    PER_DAY = "per_day"
    PER_HOUR = "per_hour"
    PER_HEAD = "per_head"
    PACKAGE = "package"

class HallType(str, Enum):
    BANQUET = "banquet"
    LAWN = "lawn"
    FARMHOUSE = "farmhouse"
    RESORT = "resort"

class IndoorOutdoor(str, Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    BOTH = "both"

class DecorationPolicy(str, Enum):
    ALLOWED = "allowed"
    IN_HOUSE_ONLY = "in-house-only"

class CateringPolicy(str, Enum):
    ALLOWED = "allowed"
    IN_HOUSE_ONLY = "in-house-only"

class AlcoholPolicy(str, Enum):
    ALLOWED = "allowed"
    NOT_ALLOWED = "not-allowed"

class ServiceStyle(str, Enum):
    BUFFET = "buffet"
    PLATED = "plated"
    LIVE_COUNTER = "live_counter"

class PackageModal(str, Enum):
    PACKAGE_BASED = "package_based"
    HOURLY = "hourly"
    FIXED = "fixed"

class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

class VenueServiceResponse(BaseModel):
    capacity_min: Optional[int] = Field(None, description="Minimum capacity")
    capacity_max: Optional[int] = Field(None, description="Maximum capacity")
    hall_type: Optional[str] = Field(None, description="Type of hall")
    indoor_outdoor: Optional[str] = Field(None, description="Indoor or outdoor")
    square_feet: Optional[float] = Field(None, description="Area in square feet")
    parking_capacity: Optional[int] = Field(None, description="Parking capacity")
    decoration_policy: Optional[str] = Field(None, description="Decoration policy")
    catering_policy: Optional[str] = Field(None, description="Catering policy")
    alcohol_policy: Optional[str] = Field(None, description="Alcohol policy")

    class Config:
        from_attributes = True

class CateringServiceResponse(BaseModel):
    cuisine_types: List[str] = Field(default=[], description="List of cuisine types")
    veg_price_per_head: Optional[float] = Field(None, description="Price per head for vegetarian")
    nonveg_price_per_head: Optional[float] = Field(None, description="Price per head for non-vegetarian")
    min_order: Optional[int] = Field(None, description="Minimum order quantity")
    max_order: Optional[int] = Field(None, description="Maximum order quantity")
    service_style: Optional[str] = Field(None, description="Service style")
    staff_included: Optional[bool] = Field(None, description="Whether staff is included")
    crockery_cutlery_included: Optional[bool] = Field(None, description="Whether crockery and cutlery are included")
    tasting_available: Optional[bool] = Field(None, description="Whether tasting is available")

    class Config:
        from_attributes = True

class DJServiceResponse(BaseModel):
    genres_supported: List[str] = Field(default=[], description="Supported music genres")
    duration_hours: Optional[float] = Field(None, description="Duration in hours")
    equipment: List[str] = Field(default=[], description="List of equipment provided")
    lighting_included: Optional[bool] = Field(None, description="Whether lighting is included")
    mc_host_available: Optional[bool] = Field(None, description="Whether MC host is available")
    setup_time_required: Optional[float] = Field(None, description="Setup time required in hours")

    class Config:
        from_attributes = True

class PhotographerServiceResponse(BaseModel):
    package_type: List[str] = Field(default=[], description="Types of packages offered")
    hours_covered: Optional[float] = Field(None, description="Hours covered")
    photos_delivered: Optional[int] = Field(None, description="Number of photos delivered")
    edited_photos_count: Optional[int] = Field(None, description="Number of edited photos")
    delivery_time_days: Optional[int] = Field(None, description="Delivery time in days")
    videography_included: Optional[bool] = Field(None, description="Whether videography is included")
    drone_available: Optional[bool] = Field(None, description="Whether drone is available")
    album_included: Optional[bool] = Field(None, description="Whether album is included")

    class Config:
        from_attributes = True

class EventManagementServiceResponse(BaseModel):
    event_types: List[str] = Field(default=[], description="Types of events managed")
    team_size: Optional[int] = Field(None, description="Size of the team")
    includes: List[str] = Field(default=[], description="List of included services")
    package_modal: Optional[str] = Field(None, description="Package modal")
    vendor_network_size: Optional[int] = Field(None, description="Size of vendor network")
    experience_years: Optional[int] = Field(None, description="Years of experience")

    class Config:
        from_attributes = True

class ServiceCreate(BaseModel):
    category: ServiceCategory = Field(..., description="Service category")
    title: str = Field(..., min_length=3, max_length=255, description="Service title")
    description: Optional[str] = Field(None, description="Service description")
    tags: List[str] = Field(default=[], description="List of tags")
    base_price: float = Field(..., ge=0, description="Base price of the service")
    pricing_type: PricingType = Field(..., description="Pricing type")
    amenities: List[str] = Field(default=[], description="List of amenities")
    address_line1: Optional[str] = Field(None, description="Address line 1")
    address_line2: Optional[str] = Field(None, description="Address line 2")
    area: Optional[str] = Field(None, max_length=150, description="Area")
    city: str = Field(..., max_length=150, description="City")
    state: str = Field(..., max_length=150, description="State")
    country: str = Field(..., max_length=150, description="Country")
    pincode: str = Field(..., max_length=20, description="Pincode")
    geo_point: Optional[GeoPoint] = Field(None, description="Geographical coordinates")

class ServiceCreateResponse(BaseModel):
    message: Optional[str] = None

class ServiceResponse(BaseModel):
    id: UUID
    vendor_id: UUID
    category: str
    title: str
    description: Optional[str]
    tags: List[str]
    base_price: float
    currency: str
    pricing_type: str
    images: List[str]
    amenities: List[str]
    featured: bool
    verified: bool
    is_active: bool
    address_line1: Optional[str]
    address_line2: Optional[str]
    area: Optional[str]
    city: str
    state: str
    country: str
    pincode: str
    geo_point: Optional[Dict]
    created_at: datetime
    updated_at: datetime
    message: Optional[str] = None
    venue_details: Optional[VenueServiceResponse] = Field(None, description="Venue-specific details")
    catering_details: Optional[CateringServiceResponse] = Field(None, description="Catering-specific details")
    dj_details: Optional[DJServiceResponse] = Field(None, description="DJ-specific details")
    photographer_details: Optional[PhotographerServiceResponse] = Field(None, description="Photographer-specific details")
    event_management_details: Optional[EventManagementServiceResponse] = Field(None, description="Event management-specific details")

    class Config:
        from_attributes = True