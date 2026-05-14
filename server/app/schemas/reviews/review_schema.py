# ============================================================
# FILE:
# app/schemas/review/review_schema.py
# ============================================================

from pydantic import BaseModel
from typing import Optional


class ReviewCreate(BaseModel):
    lead_id: int
    vendor_id: int

    rating: int
    review: Optional[str]