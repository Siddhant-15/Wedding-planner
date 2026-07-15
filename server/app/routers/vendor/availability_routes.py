from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user

from app.controller.vendor.availability_service import (
    block_dates,
    remove_blocked_date,
    get_vendor_availability
)

router = APIRouter(
    prefix="/vendor/availability",
    tags=["Vendor Availability"]
)


@router.get("/")
async def availability(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await get_vendor_availability(
        db,
        user["id"]
    )


@router.post("/block")
async def block(
    dates: list[str],
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await block_dates(
        db,
        user["id"],
        dates
    )


@router.delete("/{availability_id}")
async def remove(
    availability_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await remove_blocked_date(
        db,
        availability_id,
        user["id"]
    )