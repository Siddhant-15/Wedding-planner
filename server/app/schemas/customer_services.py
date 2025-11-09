# app/schemas/service.py
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class VendorDetailSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    experience: Optional[int] = None
    city: str
    state: str

    class Config:
        from_attributes = True

class VenueDetailSchema(BaseModel):
    capacity_max: int
    capacity_min: Optional[int] = None
    hall_type: str
    indoor_outdoor: str
    square_feet: Optional[float] = None
    parking_capacity: Optional[int] = None
    decoration_policy: str
    catering_policy: str
    alcohol_policy: str

class CateringDetailSchema(BaseModel):
    cuisine_types: List[str] = Field(default_factory=list)
    veg_price_per_head: Optional[float] = None
    nonveg_price_per_head: Optional[float] = None
    min_order: Optional[int] = None
    max_order: Optional[int] = None
    service_style: str

# Add more as needed: DJDetailSchema, etc.

class ServiceDetailResponse(BaseModel):
    id: str = Field(..., example="svc_123")
    name: str = Field(..., example="Grand Palace Venue")
    description: Optional[str] = None
    long_description: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    price: Optional[float] = None
    currency: str = Field(default="INR")
    rating: Optional[float] = None
    review_count: int = Field(default=0, ge=0)
    city: str
    state: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    pincode: Optional[str] = None
    service_type: str = Field(..., example="venue")
    amenities: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    featured: bool = False
    created_at: datetime
    updated_at: datetime

    vendor: VendorDetailSchema

    # Category-specific
    venue: Optional[VenueDetailSchema] = None
    catering: Optional[CateringDetailSchema] = None
    # dj: Optional[DJDetailSchema] = None
    # Add others as needed

    class Config:
        from_attributes = True