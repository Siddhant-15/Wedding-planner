from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controller.customer.service_view_controller import ServiceViewController
from app.db.db import get_db
from app.dependencies.auth import get_current_user_optional
from app.schemas.customer.service_view import (
    ServiceViewCreate,
    ServiceViewResponse,
)


router = APIRouter(
    prefix="/services",
    tags=["Service Views"],
)


@router.post(
    "/{service_id}/view",
    response_model=ServiceViewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def track_service_view(
    service_id: int,
    payload: ServiceViewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    """
    Track a service detail page view.

    Supports both authenticated customers and anonymous visitors.
    """

    controller = ServiceViewController(db)

    return await controller.track_view(
        service_id=service_id,
        current_user=current_user,
        visitor_id=payload.visitor_id,
    )