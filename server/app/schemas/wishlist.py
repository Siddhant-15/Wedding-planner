# app/schemas/wishlist.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class WishlistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    is_public: bool = False


class WishlistCreate(WishlistBase):
    pass


class WishlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    is_public: Optional[bool] = None


class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    is_default: bool
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
    priority: Optional[int] = Field(None, ge=0, le=3)


class WishlistItemResponse(BaseModel):
    id: int
    wishlist_id: int
    service_id: int
    note: Optional[str]
    priority: int
    created_at: datetime

    class Config:
        from_attributes = True