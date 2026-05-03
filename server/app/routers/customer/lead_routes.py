from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.leads import LeadCreate, LeadResponse
from app.schemas.lead_action import LeadActionCreate
from app.controller.services.lead_service import create_lead, get_vendor_leads, update_lead_status



from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user

LeadRouter = APIRouter(prefix="/leads", tags=["Leads"])


@LeadRouter.post("/create", response_model=LeadResponse)
async def create(
    payload: LeadCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await create_lead(db, user["id"], payload)


@LeadRouter.get("/vendor")
async def get_vendor(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await get_vendor_leads(db, user.id)


@LeadRouter.post("/action")
async def action(
    payload: LeadActionCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await update_lead_status(
        db,
        payload.lead_id,
        user.id,
        payload.action
    )