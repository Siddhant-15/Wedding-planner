from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Lead
from app.models.models import LeadAction


async def create_lead(db, user_id, data):
    # 1. Create Lead
    lead = Lead(
        user_id=user_id,
        vendor_id=data.vendor_id,

        name=data.name,
        phone=data.phone,
        email=data.email,

        event_type=data.event_type,
        event_date=data.event_date,
        event_time=data.event_time,

        location=data.location,
        budget_range=data.budget,
        guests=data.guests,

        description=data.description,
    )

    db.add(lead)
    await db.flush()  # 👈 IMPORTANT (gets lead.id without commit)

    # 2. Create Lead Action
    lead_action = LeadAction(
        lead_id=lead.id,
        vendor_id=data.vendor_id,
        action="created"
    )

    db.add(lead_action)

    # 3. Commit once (best practice)
    await db.commit()

    # 4. Refresh lead
    await db.refresh(lead)

    return lead


async def get_vendor_leads(db: AsyncSession, vendor_id: int):
    result = await db.execute(
        select(Lead).where(Lead.vendor_id == vendor_id)
    )
    return result.scalars().all()


async def update_lead_status(db: AsyncSession, lead_id: int, vendor_id: int, action: str):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()

    if not lead:
        return None

    # update status
    lead.status = action

    # create action log
    action_obj = LeadAction(
        lead_id=lead_id,
        vendor_id=vendor_id,
        action=action
    )

    db.add(action_obj)
    await db.commit()

    return lead