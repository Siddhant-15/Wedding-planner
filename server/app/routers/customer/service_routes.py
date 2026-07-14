# app/routers/customer_services.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.controller.Customer.service_controller import ServiceController

customerservicerouter = APIRouter()
logger = logging.getLogger(__name__)


@customerservicerouter.get("/{service_type}/list")
async def get_service_cards(
    service_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
    city: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await ServiceController.get_service_cards(
        db, service_type, skip, limit, city
    )


@customerservicerouter.get(
    "/services/detail/{service_id}",
    response_model=None,  # We'll return the Pydantic model directly
    status_code=status.HTTP_200_OK
)
async def get_service_detail(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return await ServiceController.get_service_detail(db, service_id, current_user)