from sqlalchemy import select, func, desc
from sqlalchemy.orm import joinedload, selectinload
from app.models.models import Service


def base_service_query(service_type: str):
    return (
        select(Service)
        .options(
            joinedload(Service.vendor),
            joinedload(Service.venue),
            selectinload(Service.variants),
            selectinload(Service.media),
        )
        .filter(
            Service.service_type == service_type,
            Service.is_active == True,
        )
    )


def base_count_query(service_type: str):
    return select(func.count(Service.id)).filter(
        Service.service_type == service_type,
        Service.is_active == True,
    )


def service_detail_query(service_id: int):
    return (
        select(Service)
        .where(
            Service.id == service_id,
            Service.is_active.is_(True),
        )
        .options(
            selectinload(Service.vendor),

            selectinload(Service.venue),
            selectinload(Service.catering),
            selectinload(Service.dj),
            selectinload(Service.photography),
            selectinload(Service.event_management),
            selectinload(Service.makeup_artist),

            selectinload(Service.variants),
            selectinload(Service.media),
            selectinload(Service.unavailable_dates),
        )
    )


def service_media_query(service_id: int):
    return (
        select(Service)
        .options(selectinload(Service.media))
        .filter(
            Service.id == service_id,
            Service.is_active == True,
        )
    )