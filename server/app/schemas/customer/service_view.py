from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ServiceViewCreate(BaseModel):
    """
    Request payload for tracking a service view.

    visitor_id is used only for anonymous visitors.
    For authenticated customers, the backend identifies the
    customer from the access token.
    """

    visitor_id: Optional[UUID] = Field(
        default=None,
        description="Persistent anonymous browser identifier",
    )


class ServiceViewResponse(BaseModel):
    tracked: bool
    message: str


class ServiceViewStatsResponse(BaseModel):
    service_id: int
    total_views: int