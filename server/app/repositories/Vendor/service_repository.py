from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.models.models import Service, Vendor


_ALL_OPTS = [
    joinedload(Service.venue),
    joinedload(Service.catering),
    joinedload(Service.dj),
    joinedload(Service.photography),
    joinedload(Service.event_management),
    joinedload(Service.makeup_artist),
    joinedload(Service.variants),
    joinedload(Service.media),
    joinedload(Service.unavailable_dates),
]


async def get_vendor_id(db, email):
    result = await db.execute(
        select(Vendor.id).where(Vendor.email == email)
    )
    return result.scalar_one_or_none()


async def get_all_vendor_services(db, current_user):
    vendor_id = await get_vendor_id(db, current_user["email"])

    result = await db.execute(
        select(Service)
        .filter(Service.vendor_id == vendor_id)
        .options(*_ALL_OPTS)
    )

    return result.scalars().unique().all()


async def get_service_with_relations(id, db, current_user):
    vendor_id = await get_vendor_id(db, current_user["email"])

    result = await db.execute(
        select(Service)
        .filter(
            Service.id == id,
            Service.vendor_id == vendor_id
        )
        .options(*_ALL_OPTS)
    )

    return result.unique().scalar_one_or_none()