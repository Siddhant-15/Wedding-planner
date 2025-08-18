from typing import Optional
from pydantic import conint, constr, model_validator
from .base import StrictModel

class ReviewCreate(StrictModel):
    user_id: int
    venue_id: Optional[int] = None
    service_id: Optional[int] = None
    rating: conint(ge=1, le=5)
    title: Optional[constr(max_length=120)] = None
    body: Optional[constr(max_length=2000)] = None

    @model_validator(mode="after")
    def check_one_target(self):
        if not self.venue_id and not self.service_id:
            raise ValueError("Review must be for either a venue or a service.")
        return self


class ReviewOut(StrictModel):
    id: int
    user_id: int
    venue_id: Optional[int]
    service_id: Optional[int]
    rating: int
    title: Optional[str]
    body: Optional[str]
