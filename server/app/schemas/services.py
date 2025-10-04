from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from uuid import UUID
from datetime import datetime



# Enums (assuming these are defined in your models)
class ServiceCategory(str, Enum):
    VENUE = "venue"
    CATERING = "catering"
    DJ = "dj"
    EVENT_MANAGEMENT = "event_management"
    PHOTOGRAPHY = "photographer"
    # Add other categories as needed

class PricingType(str, Enum):
    PER_DAY = "per_day"
    PER_HOUR = "per_hour"
    PER_HEAD = "per_head"
    PACKAGE = "package"

# Pydantic Schemas
class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

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

class ServiceResponse(BaseModel):
    id: UUID
    service_code: str
    vendor_id: UUID
    category: ServiceCategory
    title: str
    slug: Optional[str]
    description: Optional[str]
    tags: List[str]
    base_price: float
    currency: str
    pricing_type: PricingType
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
    geo_point: Optional[GeoPoint]
    created_at: datetime
    updated_at: Optional[datetime]
    message: Optional[str] = None

    class Config:
        from_attributes = True