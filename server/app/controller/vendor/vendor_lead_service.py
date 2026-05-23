# ============================================================
# FILE:
# app/controller/vendor/vendor_lead_service.py
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import date

from app.infrastructure.db.models.models import (
    Lead,
    LeadAction,
    UnlockUsage,
    VendorSubscription,
    Subscription,
    VendorUnavailableDate
)

from app.utils.notification.notification import create_notification


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
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.vendor_id == vendor_id
    )

    result = await db.execute(stmt)

    lead = result.scalar_one_or_none()

    if not lead:
        raise Exception("Lead not found")

    allowed_actions = [
        "accept",
        "reject",
        "date-unavailable",
        "unlock",
        "won",
        "lost"
    ]

    if action not in allowed_actions:
        raise Exception("Invalid action")

    # ACCEPT
    if action == "accept":
        lead.status = "accepted"
        lead.customer_status = "VENDOR_REVIEWING"

        db.add(
            LeadAction(
                lead_id=lead.id,
                vendor_id=vendor_id,
                action="accepted"
            )
        )

    # REJECT
    elif action == "reject":
        lead.customer_status = "VENDOR_REJECTED"

        db.add(
            LeadAction(
                lead_id=lead.id,
                vendor_id=vendor_id,
                action="rejected"
            )
        )

    # DATE UNAVAILABLE
    elif action == "date-unavailable":
        lead.customer_status = "DATE_UNAVAILABLE"

        # db.add(
        #     VendorUnavailableDate(
        #         vendor_id=vendor_id,
        #         # blocked_date=lead.event_date,
        #         reason="Vendor marked unavailable"
        #     )
        # )
        db.add(
            LeadAction(
                lead_id=lead.id,
                vendor_id=vendor_id,
                action="date_unavailable"
            )
        )

    # UNLOCK CONTACT
    elif action == "unlock":

        sub_stmt = (
            select(Subscription.daily_unlock_limit)
            .join(
                VendorSubscription,
                VendorSubscription.subscription_id == Subscription.id
            )
            .where(
                VendorSubscription.vendor_id == vendor_id,
                VendorSubscription.status == "active"
            )
        )

        sub_result = await db.execute(sub_stmt)

        limit = sub_result.scalar() or 3

        usage_stmt = select(UnlockUsage).where(
            UnlockUsage.vendor_id == vendor_id,
            UnlockUsage.usage_date == date.today()
        )

        usage_result = await db.execute(usage_stmt)

        usage = usage_result.scalar_one_or_none()

        if usage and usage.used_count >= limit:
            raise Exception("Daily unlock limit reached")

        lead.phone_unlocked = True
        lead.status = "unlocked"
        lead.customer_status = "CONTACT_SHARED"

        if usage:
            usage.used_count += 1
        else:
            db.add(
                UnlockUsage(
                    vendor_id=vendor_id,
                    usage_date=date.today(),
                    used_count=1
                )
            )

    # WON
    elif action == "won":
        lead.status = "won"
        lead.customer_status = "BOOKED"

    # LOST
    elif action == "lost":
        lead.status = "lost"

    await db.commit()

    await db.refresh(lead)

    return lead


