from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
import decimal


# =========================
# UNAVAILABLE DATES
# =========================
class UnavailableDateResponse(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# ENUM
# =========================
class PricingType(str, Enum):
    PER_PLATE = "PER_PLATE"
    BASE_PRICE = "BASE_PRICE"
    PER_HOUR = "PER_HOUR"
    PER_DAY = "PER_DAY"
    PER_EVENT = "PER_EVENT"
    PACKAGE = "PACKAGE"
    CUSTOM = "CUSTOM"
    HYBRID = "HYBRID"


# =========================
# MEDIA
# =========================
class ServiceMediaResponse(BaseModel):
    id: int
    service_id: int
    media_url: str
    media_type: str
    is_cover: bool
    display_order: int
    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


# =========================
# GEO
# =========================
class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


# =========================
# VENUE
# =========================
class VenueCreate(BaseModel):
    venue_type: str = Field(..., max_length=50)
    venue_nature: str = Field(..., max_length=20)
    min_capacity: int = Field(..., gt=0)
    max_capacity: int = Field(..., gt=0)
    square_feet: decimal.Decimal = Field(..., gt=0)
    parking_capacity: Optional[int] = 0

    catering_options: Dict[str, Any] = Field(default_factory=dict)

    # FIXED: must be list
    amenities: List[str] = Field(default_factory=list)
    venue_rules: List[str] = Field(default_factory=list)


class VenueResponse(VenueCreate):
    id: int
    service_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# VARIANTS
# =========================
class ServiceVariantCreate(BaseModel):
    variant_name: str = Field(..., max_length=100)
    description: Optional[str] = None

    min_quantity: Optional[int] = None
    max_quantity: Optional[int] = None

    pricing_type: str = Field(..., max_length=50)
    currency: Optional[str] = "INR"

    pricing: Dict[str, Any] = Field(default_factory=dict)

    # FIXED: list instead of dict
    menu: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)

    inclusions: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)

    policies: Dict[str, Any] = Field(default_factory=dict)
    
    is_default: bool = False

    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")


class ServiceVariantResponse(ServiceVariantCreate):
    id: int
    service_id: int
    is_active: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


# =========================
# SERVICE CREATE
# =========================
class ServiceCreate(BaseModel):
    service_type: str = Field(..., max_length=50)
    service_name: str = Field(..., max_length=150)

    description: Optional[str] = None

    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    area: Optional[str] = None

    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    pincode: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")

    venue: Optional[VenueCreate] = None
    variants: List[ServiceVariantCreate] = Field(default_factory=list)


# =========================
# SERVICE RESPONSE
# =========================
class ServiceResponse(BaseModel):
    id: int
    vendor_id: int

    service_type: str
    service_name: str
    description: Optional[str]

    add_line1: Optional[str]
    add_line2: Optional[str]
    area: Optional[str]

    city: Optional[str]
    state: Optional[str]
    country: str
    pincode: Optional[str]

    latitude: Optional[float]
    longitude: Optional[float]

    status: str
    is_active: bool
    is_verified: bool

    created_at: datetime
    updated_at: datetime

    # CRITICAL FIX
    metadata: Dict[str, Any] = Field(default_factory=dict)

    venue: Optional[VenueResponse] = None
    variants: List[ServiceVariantResponse] = Field(default_factory=list)
    media: List[ServiceMediaResponse] = Field(default_factory=list)
    unavailable_dates: List[UnavailableDateResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
        populate_by_name = True


# =========================
# CREATE RESPONSE
# =========================
class ServiceCreateResponse(BaseModel):
    message: Optional[str] = None
    service_id: Optional[int] = None
