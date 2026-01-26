# app/schemas/wishlist.py
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

class WishlistItemCreate(BaseModel):
    service_id: UUID

class ServiceInWishlist(BaseModel):
    id: UUID
    title: str
    base_price: int  # in paise
    images: List[str]
    vendor_id: UUID
    category: str = Field(..., alias="service_type")
    rating: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class WishlistItemOut(BaseModel):
    id: UUID
    service_id: UUID
    created_at: datetime
    service: ServiceInWishlist

    class Config:
        from_attributes = True