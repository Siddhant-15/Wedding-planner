from decimal import Decimal
from pydantic import BaseModel, Field


class VendorDashboardKPIsResponse(BaseModel):
    total_services: int = Field(default=0)
    live_services: int = Field(default=0)

    total_leads: int = Field(default=0)
    new_leads: int = Field(default=0)

    total_views: int = Field(default=0)

    average_rating: Decimal = Field(default=Decimal("0.00"))
    total_reviews: int = Field(default=0)