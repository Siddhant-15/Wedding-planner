from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from decimal import Decimal
from datetime import datetime
from enum import Enum

class ServiceType(str, Enum):
    WEDDING_VENUES = "Wedding Venue"
    DJS = "DJ"
    EVENT_MANAGEMENT = "Event Management"
    CATERING = "Catering"
    PHOTOGRAPHY = "Photography"

class ServiceImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    path: str

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    type: ServiceType
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    venue: Optional[str] = None
    capacity: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)


class ServiceCreate(ServiceBase):
    # user_id: str
    images: List[str] = Field(default_factory=list)

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    type: Optional[ServiceType] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    venue: Optional[str] = None
    capacity: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None  


class ServiceResponse(ServiceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    images: List[ServiceImageResponse] = []

    class Config:
        from_attributes = True
