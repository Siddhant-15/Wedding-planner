from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.models import Lead, LeadAction
from app.utils.notification.notification import create_notification
from app.utils.notification.realtime import send_realtime_notification



async def create_lead(db, user_id, data):
    try:
        lead = Lead(
            user_id=user_id,

            vendor_id=data.vendor_id,

            # NEW
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
        )

        db.add(lead)

        await db.flush()

        # db.add(
        #     LeadAction(
        #         lead_id=lead.id,
        #         vendor_id=data.vendor_id,
        #         action="created"
        #     )
        # )

        await create_notification(
            db=db,
            recipient_id=data.vendor_id,
            recipient_type="vendor",
            type="new_lead",
            title="New Lead Received 🎉",
            message=f"{data.name} is interested in your service",
            data={
                "lead_id": lead.id,
                "service_id": data.service_id
            }
        )

        await db.commit()

        await db.refresh(lead)

        await send_realtime_notification(
            recipient_id=data.vendor_id,
            recipient_type="vendor",
            payload={
                "type": "new_lead",
                "title": "New Lead Received 🎉",
                "message": f"{data.name} is interested in your service",
                "data": {
                    "lead_id": lead.id,
                    "service_id": data.service_id
                }
            }
        )

        return lead

    except Exception as e:
        await db.rollback()
        raise e



async def get_customer_leads(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(Lead)
        .where(Lead.user_id == user_id)
        .order_by(desc(Lead.created_at))
    )

    result = await db.execute(stmt)

    return result.scalars().all()


async def get_vendor_leads(
    db: AsyncSession,
    vendor_id: int
):
    stmt = (
        select(Lead)
        .where(Lead.vendor_id == vendor_id)
        .order_by(desc(Lead.created_at))
    )

    result = await db.execute(stmt)

    return result.scalars().all()


async def update_lead_status(
    db: AsyncSession,
    lead_id: int,
    vendor_id: int,
    action: str
):
    try:
        result = await db.execute(
            select(Lead).where(Lead.id == lead_id)
        )
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

        # 🔔 OPTIONAL: notify customer (future use)
        if action == "viewed":
            await create_notification(
                db=db,
                recipient_id=lead.user_id,
                recipient_type="customer",
                type="lead_viewed",
                title="Vendor viewed your request 👀",
                message="A vendor has checked your request",
                data={"lead_id": lead_id}
            )

        await db.commit()

        return lead

    except Exception as e:
        await db.rollback()
        raise e