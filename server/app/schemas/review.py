from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str]


class ReviewCreate(ReviewBase):
    customer_id: str
    vendor_id: Optional[str]
    venue_id: Optional[str]
    service_id: Optional[str]


class ReviewResponse(ReviewBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True