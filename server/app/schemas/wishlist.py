# app/schemas/wishlist.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from enum import Enum

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class WishlistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    is_public: bool = False


class WishlistCreate(WishlistBase):
    pass


class ServiceMiniResponse(BaseModel):
    id: int
    name: str
    service_type: str
    image: Optional[str] = None
    location: Optional[str] = None
    pricing: Optional[Dict[str, Any]] = None
    rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0
    vendor_name: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class WishlistItemAddResponse(BaseModel):
    id: int
    wishlist_id: int
    service_id: int
    note: Optional[str] = None
    priority: Optional[str] = None
    service: Optional[ServiceMiniResponse] = None

    class Config:
        from_attributes = True


class WishlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)


class WishlistItemsResponse(BaseModel):
    id: int
    service_id: int
    wishlist_id: int
    note: Optional[str] = None
    priority: Optional[str] = None
    service: Optional[ServiceMiniResponse] = None

    class Config:
        from_attributes = True


class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    is_default: bool
    items: List[WishlistItemsResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ------------------------
# Wishlist Items
# ------------------------

class WishlistItemCreate(BaseModel):
    wishlist_id: int
    service_id: int


class WishlistItemUpdate(BaseModel):
    note: Optional[str] = None
    priority: Optional[Priority] = None


class WishlistItemResponse(BaseModel):
    id: int
    service_id: int
    wishlist_id: int
    note: Optional[str] = None
    priority: Optional[str] = None
    service: Optional[ServiceMiniResponse] = None

    class Config:
        from_attributes = True


class WishlistDetailResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_public: bool = False
    items: List[WishlistItemResponse] = []

    class Config:
        from_attributes = True