from typing import Optional, List
from pydantic import constr, confloat, conint
from .base import StrictModel

class Address(StrictModel):
    address_line1: constr(min_length=1, max_length=120)
    address_line2: Optional[constr(max_length=120)] = None
    city: constr(min_length=1, max_length=60)
    state: constr(min_length=1, max_length=60)
    pincode: constr(min_length=4, max_length=10)
    country: constr(min_length=2, max_length=56) = "India"

class VenueCreate(StrictModel):
    vendor_id: int
    name: constr(min_length=2, max_length=150)
    description: Optional[constr(max_length=2000)] = None
    address: Address
    capacity_min: conint(ge=1) = 50
    capacity_max: conint(ge=1) = 500
    price_per_day: confloat(ge=0) = 0
    amenities: List[str] = []
    images: List[str] = []

class VenueUpdate(StrictModel):
    name: Optional[constr(min_length=2, max_length=150)] = None
    description: Optional[constr(max_length=2000)] = None
    address: Optional[Address] = None
    capacity_min: Optional[conint(ge=1)] = None
    capacity_max: Optional[conint(ge=1)] = None
    price_per_day: Optional[confloat(ge=0)] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None

class VenueOut(StrictModel):
    id: int
    vendor_id: int
    name: str
    description: Optional[str]
    address: Address
    capacity_min: int
    capacity_max: int
    price_per_day: float
    amenities: List[str]
    images: List[str]
