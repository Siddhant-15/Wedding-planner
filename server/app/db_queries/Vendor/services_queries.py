from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.models.models import Service, ServiceVariant, ServiceMedia, Vendor


ALL_SERVICE_OPTIONS = [
    joinedload(Service.vendor),
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


def get_vendor_id_by_email(email: str):
    return select(Vendor.id).where(Vendor.email == email)


def get_service_by_id(service_id: int, vendor_id: int):
    return (
        select(Service)
        .filter(Service.id == service_id, Service.vendor_id == vendor_id)
        .options(*ALL_SERVICE_OPTIONS)
    )


def get_vendor_services(vendor_id: int):
    return (
        select(Service)
        .filter(Service.vendor_id == vendor_id)
        .options(*ALL_SERVICE_OPTIONS)
    )