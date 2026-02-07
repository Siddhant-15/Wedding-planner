from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AppointmentBase(BaseModel):
    appointment_date: datetime
    status: Optional[str] = "pending"


class AppointmentCreate(AppointmentBase):
    customer_id: str
    vendor_id: Optional[str]
    venue_id: Optional[str]
    service_id: Optional[str]


class AppointmentResponse(AppointmentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True