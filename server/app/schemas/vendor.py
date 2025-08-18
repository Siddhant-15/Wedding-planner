from typing import Optional
from pydantic import constr, AnyUrl
from .base import StrictModel

class VendorCreate(StrictModel):
    user_id: int
    business_name: constr(min_length=2, max_length=150)
    description: Optional[constr(max_length=2000)] = None
    address_line1: Optional[constr(max_length=120)] = None
    address_line2: Optional[constr(max_length=120)] = None
    city: Optional[constr(max_length=60)] = None
    state: Optional[constr(max_length=60)] = None
    pincode: Optional[constr(max_length=10)] = None
    country: Optional[constr(max_length=56)] = "India"
    phone: Optional[constr(max_length=20)] = None
    website: Optional[AnyUrl] = None

class VendorUpdate(StrictModel):
    business_name: Optional[constr(min_length=2, max_length=150)] = None
    description: Optional[constr(max_length=2000)] = None
    address_line1: Optional[constr(max_length=120)] = None
    address_line2: Optional[constr(max_length=120)] = None
    city: Optional[constr(max_length=60)] = None
    state: Optional[constr(max_length=60)] = None
    pincode: Optional[constr(max_length=10)] = None
    country: Optional[constr(max_length=56)] = None
    phone: Optional[constr(max_length=20)] = None
    website: Optional[AnyUrl] = None

class VendorOut(VendorCreate):
    id: int
