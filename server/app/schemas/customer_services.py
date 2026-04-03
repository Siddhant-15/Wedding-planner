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
    id: str
    name: str
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

class VenueDetailSchema(BaseModel):
    venue_type: str
    venue_nature: str
    max_capacity: int
    parking_capacity: Optional[int]
    catering_options: Dict[str, Any]
    amenities: Optional[List[str]]   
    venue_rules: Optional[List[str]] 
    
    class Config:
        from_attributes = True

class ServiceVariantDetailSchema(BaseModel):
    id: int
    variant_name: str
    description: Optional[str]
    min_quantity: Optional[int]
    max_quantity: Optional[int]
    pricing_type: str
    currency: Optional[str]
    pricing: Dict[str, Any]
    menu: Optional[List[str]]          
    deliverables: Optional[List[str]]  
    inclusions: Optional[List[str]]
    exclusions: Optional[List[str]]
    policies: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class ServiceCardSchema(BaseModel):
    id: str
    name: str
    description: Optional[str]
    images: List[str]
    area: str
    city: Optional[str]
    state: Optional[str]
    add_line1: Optional[str]
    add_line2: Optional[str]
    country: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    vendor_name: str
    vendor_id: str
    service_type: str
    venue: Optional[VenueDetailSchema] = None
    variants: List[ServiceVariantDetailSchema] = Field(default_factory=list)

class ServiceDetailResponse(ServiceCardSchema):
    long_description: Optional[str]
    pincode: Optional[str]
    metadata: Optional[Dict[str, Any]]
    featured: bool
    created_at: datetime
    updated_at: datetime
    vendor: VendorCardSchema
    user_role: Optional[str]
    unavailable_dates: List[UnavailableDateSchema] = Field(default_factory=list)
