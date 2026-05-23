from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from app.infrastructure.db.models.models import (
    Lead,
    VendorUnavailableDate
)

from app.utils.notification.notification import create_notification


async def create_lead(
    db: AsyncSession,
    user_id: int,
    data
):

    # DUPLICATE CHECK

    duplicate_stmt = select(Lead).where(
        Lead.user_id == user_id,
        Lead.vendor_id == data.vendor_id,
        Lead.event_date == data.event_date,
        Lead.status.in_([
            "new",
            "accepted",
            "unlocked",
            "quoted"
        ])
    )

    duplicate_result = await db.execute(
        duplicate_stmt
    )

    duplicate = duplicate_result.scalar_one_or_none()

    if duplicate:
        raise Exception(
            "Lead already exists for this date"
        )

    lead = Lead(
        user_id=user_id,

        vendor_id=data.vendor_id,

        service_id=data.service_id,

        service_type=data.service_type,

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

        status="new",

        customer_status="REQUEST_SUBMITTED",

        phone_unlocked=False
    )

    db.add(lead)

    await db.commit()

    await db.refresh(lead)

    await create_notification(
        db=db,
        recipient_id=data.vendor_id,
        recipient_type="vendor",
        type="new_lead",
        title="New Lead Received",
        message=f"{data.name} sent you a lead request"
    )

    return lead


async def get_customer_leads(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(Lead)
        .options(
            selectinload(Lead.vendor), 
            selectinload(Lead.service) 
        )
        .where(Lead.user_id == user_id)
        .order_by(desc(Lead.created_at))
    )

    result = await db.execute(stmt)

    leads = result.scalars().all()

    return [
    {
        "id": lead.id,
        "service_id": lead.service_id,
        "service_name": lead.service.service_name,
        "vendor_id": lead.vendor_id,
        "vendor_name": lead.vendor.first_name,
        "service_type": lead.service_type,
        "name": lead.name,
        "phone": lead.phone,
        "email": lead.email,
        "event_type": lead.event_type,
        "event_date": lead.event_date,
        "event_time": lead.event_time,
        "location": lead.location,
        "budget_range": lead.budget_range,
        "guests": lead.guests,
        "description": lead.description,
        "status": lead.status,
        "customer_status": lead.customer_status,
        "phone_unlocked": lead.phone_unlocked,
        "created_at": lead.created_at,
        "updated_at": lead.updated_at,
    }
    for lead in leads
]


async def update_customer_lead(
    db: AsyncSession,
    lead_id: int,
    user_id: int,
    payload
):
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.user_id == user_id
    )

    result = await db.execute(stmt)

    lead = result.scalar_one_or_none()

    if not lead:
        raise Exception("Lead not found")

    if datetime.utcnow() > lead.editable_until:
        raise Exception("Edit window expired")

    update_data = payload.dict(exclude_unset=True)

    for key, value in update_data.items():
        if key == "budget":
            setattr(lead, "budget_range", value)
        else:
            setattr(lead, key, value)

    await db.commit()

    await db.refresh(lead)

    return lead


async def close_customer_lead(
    db: AsyncSession,
    lead_id: int,
    user_id: int
):
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.user_id == user_id
    )

    result = await db.execute(stmt)

    lead = result.scalar_one_or_none()

    if not lead:
        raise Exception("Lead not found")

    lead.status = "new"
    lead.customer_status = "CUSTOMER_CLOSED"

    await db.commit()

    await create_notification(
        db=db,
        recipient_id=lead.vendor_id,
        recipient_type="vendor",
        type="lead_closed",
        title="Lead Closed",
        message=f"{lead.name} closed the lead"
    )

    return {
        "message": "Lead closed"
    }