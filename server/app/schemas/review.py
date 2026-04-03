from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class ReviewCreate(BaseModel):
    service_id: int
    user_id: int

    overall_rating: int = Field(..., ge=1, le=5)
    food_beverage_rating: Optional[int] = Field(None, ge=1, le=5)
    service_quality_rating: Optional[int] = Field(None, ge=1, le=5)
    ambiance_rating: Optional[int] = Field(None, ge=1, le=5)
    value_for_money_rating: Optional[int] = Field(None, ge=1, le=5)

    title: Optional[str]
    review_text: Optional[str]
    photos: Optional[List[str]] = []

    event_type: Optional[str]
    event_date: Optional[date]

class ReviewResponse(ReviewCreate):
    id: int
    helpful_count: int

    class Config:
        orm_mode = True

class UserInfo(BaseModel):
    id: int
    name: str
    avatar: Optional[str]
    location: Optional[str]

class Ratings(BaseModel):
    overall: int
    foodBeverage: Optional[int]
    serviceQuality: Optional[int]
    ambiance: Optional[int]
    valueForMoney: Optional[int]

class OwnerResponse(BaseModel):
    text: str
    date: datetime

class ReviewOut(BaseModel):
    id: int
    user: UserInfo
    ratings: Ratings
    title: Optional[str]
    text: Optional[str]
    photos: List[str]
    eventType: Optional[str]
    eventDate: Optional[date]
    createdAt: datetime
    isVerified: bool
    helpfulCount: int
    response: Optional[OwnerResponse]
