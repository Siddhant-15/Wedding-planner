from datetime import date
from typing import List
from pydantic import BaseModel
from .base import StrictModel

class AvailabilitySlot(StrictModel):
    date: date
    is_available: bool = True

class BulkAvailabilityUpsertRequest(StrictModel):
    venue_id: int
    slots: List[AvailabilitySlot]

class AvailabilityOut(StrictModel):
    venue_id: int
    slots: List[AvailabilitySlot]
