# ============================================================
# FILE:
# app/schemas/vendor/availability_schema.py
# ============================================================

from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class BlockDatesSchema(BaseModel):
    dates: List[date]
    reason: Optional[str]