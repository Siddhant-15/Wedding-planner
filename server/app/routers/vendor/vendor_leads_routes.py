from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

from app.controller.vendor.vendor_lead_service import (
    get_vendor_leads,
    update_lead_status
)

router = APIRouter(
    prefix="/vendor/leads",
    tags=["Vendor Leads"]
)


@router.get("/")
async def leads(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await get_vendor_leads(
        db,
        user["id"]
    )



@router.patch("/{lead_id}/{action}")
async def lead_action(
    lead_id: int,
    action: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await update_lead_status(
        db=db,
        lead_id=lead_id,
        vendor_id=user["id"],
        action=action
    )