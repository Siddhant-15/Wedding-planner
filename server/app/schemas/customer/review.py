from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ReviewUserOut(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    location: Optional[str] = None
    is_verified: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    """Used when receiving JSON."""
    service_id: int
    overall_rating: int = Field(..., ge=1, le=5)
    food_beverage_rating: Optional[int] = Field(None, ge=1, le=5)
    service_quality_rating: Optional[int] = Field(None, ge=1, le=5)
    ambiance_rating: Optional[int] = Field(None, ge=1, le=5)
    value_for_money_rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    review_text: Optional[str] = None
    event_type: Optional[str] = Field(None, max_length=100)
    event_date: Optional[date] = None


class ReviewOut(BaseModel):
    id: int
    service_id: int
    user_id: int
    overall_rating: int
    food_beverage_rating: Optional[int] = None
    service_quality_rating: Optional[int] = None
    ambiance_rating: Optional[int] = None
    value_for_money_rating: Optional[int] = None
    title: Optional[str] = None
    review_text: Optional[str] = None
    text: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    photos: Optional[List[str]] = None
    helpful_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_verified: bool = False
    ratings: Optional[dict] = None

    # Frontend-friendly nested user
    user: Optional[ReviewUserOut] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewListOut(BaseModel):
    reviews: List[ReviewOut]
    total: int = 0
    average_rating: float = 0.0
    total_reviews: int = 0
    rating_breakdown: dict = Field(default_factory=lambda: {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0})


class ReviewUpdate(BaseModel):
    overall_rating: Optional[int] = Field(None, ge=1, le=5)
    food_beverage_rating: Optional[int] = Field(None, ge=1, le=5)
    service_quality_rating: Optional[int] = Field(None, ge=1, le=5)
    ambiance_rating: Optional[int] = Field(None, ge=1, le=5)
    value_for_money_rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    review_text: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None