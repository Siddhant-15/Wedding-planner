from typing import Optional, List
from pydantic import constr, confloat
from .base import StrictModel
from .common import Currency
from enum import Enum

class ServiceType(str, Enum):
    CATERING = "catering"
    DJ = "dj"
    PHOTOGRAPHY = "photography"
    DECOR = "decor"
    MAKEUP = "makeup"
    OTHER = "other"

class ServiceCreate(StrictModel):
    vendor_id: int
    name: constr(min_length=2, max_length=150)
    service_type: ServiceType
    description: Optional[constr(max_length=2000)] = None
    base_price: confloat(ge=0) = 0
    unit: constr(min_length=1, max_length=20) = "day"
    images: List[str] = []

class ServiceUpdate(StrictModel):
    name: Optional[constr(min_length=2, max_length=150)] = None
    description: Optional[constr(max_length=2000)] = None
    base_price: Optional[confloat(ge=0)] = None
    unit: Optional[constr(min_length=1, max_length=20)] = None
    images: Optional[List[str]] = None

class ServiceOut(StrictModel):
    id: int
    vendor_id: int
    name: str
    service_type: ServiceType
    description: Optional[str]
    base_price: float
    unit: str
    images: List[str]
