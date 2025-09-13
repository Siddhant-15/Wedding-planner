from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ImageCreate(BaseModel):
    url: str
    venue_id: Optional[str] = None
    service_id: Optional[str] = None


class ImageResponse(BaseModel):
    id: UUID
    url: str
    venue_id: Optional[str]
    service_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True