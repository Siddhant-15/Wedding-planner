from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime


class AvailabilitySlot(BaseModel):
    date: date
    time: Optional[time] = None
    is_available: bool = True


class BulkAvailabilityUpsertRequest(BaseModel):
    venue_id: Optional[str] = None
    vendor_id: Optional[str] = None
    service_id: Optional[str] = None
    slots: List[AvailabilitySlot]


class AvailabilityOut(BaseModel):
    venue_id: Optional[str] = None
    vendor_id: Optional[str] = None
    service_id: Optional[str] = None
    slots: List[AvailabilitySlot]

    class Config:
        from_attributes = True
