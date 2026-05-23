# ─────────────────────────────────────────────────────────────────────────────
# schemas/admin/moderation.py
# ─────────────────────────────────────────────────────────────────────────────
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
 
 
class ApproveRequest(BaseModel):
    notes: Optional[str] = None
 
 
class RejectRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=1000)
 
 
class RollbackRequest(BaseModel):
    target_version_id: int
    reason: str = Field(..., min_length=5)
 
 
class ModerationQueueResponse(BaseModel):
    id: int
    service_id: int
    version_number: int
    state: str
    submitted_at: Optional[datetime]
    created_by: int
    created_at: datetime
 
    class Config:
        from_attributes = True