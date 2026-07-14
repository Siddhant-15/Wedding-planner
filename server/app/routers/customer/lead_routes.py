from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

from app.schemas.Customer.lead_schema import (
    LeadCreate,
    LeadResponse,
    LeadUpdate
)

from app.controller.Customer.lead_service import (
    create_lead,
    get_customer_leads,
    update_customer_lead,
    close_customer_lead
)

router = APIRouter(
    prefix="/customer/leads",
    tags=["Customer Leads"]
)


@router.post("/create", response_model=LeadResponse)
async def create(
    payload: LeadCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await create_lead(
        db,
        user["id"],
        payload
    )


@router.get("/")
async def my_requests(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await get_customer_leads(
        db,
        user["id"]
    )


@router.patch("/{lead_id}")
async def update_request(
    lead_id: int,
    payload: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await update_customer_lead(
        db,
        lead_id,
        user["id"],
        payload
    )


@router.patch("/{lead_id}/close")
async def close_request(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await close_customer_lead(
        db,
        lead_id,
        user["id"]
    )