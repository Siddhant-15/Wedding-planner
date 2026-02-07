from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class BookingBase(BaseModel):
    booking_date: datetime
    status: Optional[str] = "pending"


class BookingCreate(BookingBase):
    customer_id: str
    vendor_id: Optional[str]
    venue_id: Optional[str]
    service_id: Optional[str]


class BookingResponse(BookingBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True