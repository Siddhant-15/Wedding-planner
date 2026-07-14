from pydantic import BaseModel
from datetime import datetime


class LeadActionCreate(BaseModel):
    lead_id: int
    action: str


class LeadActionResponse(BaseModel):
    id: int
    lead_id: int
    vendor_id: int
    action: str
    created_at: datetime

    class Config:
        from_attributes = True