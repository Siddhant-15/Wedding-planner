# ============================================================
# FILE:
# app/schemas/vendor/vendor_lead_schema.py
# ============================================================

from pydantic import BaseModel
from typing import Optional


class RejectLeadSchema(BaseModel):
    reason: Optional[str]


class LostLeadSchema(BaseModel):
    reason: Optional[str]