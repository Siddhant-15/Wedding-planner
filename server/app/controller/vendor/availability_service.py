# ============================================================
# FILE:
# app/controller/vendor/availability_service.py
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import VendorUnavailableDate


async def get_vendor_availability(
    db: AsyncSession,
    vendor_id: int
):
    stmt = select(VendorUnavailableDate).where(
        VendorUnavailableDate.vendor_id == vendor_id
    )

    result = await db.execute(stmt)

    return result.scalars().all()


async def block_dates(
    db: AsyncSession,
    vendor_id: int,
    payload
):
    for d in payload.dates:
        db.add(
            VendorUnavailableDate(
                vendor_id=vendor_id,
                blocked_date=d,
                reason=payload.reason
            )
        )

    await db.commit()

    return {
        "message": "Dates blocked"
    }


async def remove_blocked_date(
    db: AsyncSession,
    availability_id: int,
    vendor_id: int
):
    stmt = select(VendorUnavailableDate).where(
        VendorUnavailableDate.id == availability_id,
        VendorUnavailableDate.vendor_id == vendor_id
    )

    result = await db.execute(stmt)

    blocked = result.scalar_one_or_none()

    if not blocked:
        raise Exception("Blocked date not found")

    await db.delete(blocked)

    await db.commit()

    return {
        "message": "Blocked date removed"
    }