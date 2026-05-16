import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

from app.models.models import Service, ServiceVariant, ServiceMedia
from app.schemas.Vendor.services import ServiceCreate, ServiceCreateResponse

from app.utils.Vendor.media_service import upload_file
from app.utils.Vendor.variants import enforce_variants
from app.db_queries.Vendor.services_queries import (
    get_service_by_id,
    get_vendor_services,
    get_vendor_id_by_email
)


class ServicesController:

    @staticmethod
    async def get_vendor_id(db: AsyncSession, email: str):
        result = await db.execute(get_vendor_id_by_email(email))
        return result.scalar_one_or_none()  

    # ───────── CREATE ─────────
    @staticmethod
    async def create(db: AsyncSession, current_user, form_data, images, videos, image_meta, external_media):

        if current_user.get("role") != "vendor":
            raise Exception("Vendor role required")

        vendor_id = await ServicesController.get_vendor_id(db, current_user["email"])
        if not vendor_id:
            raise Exception("Vendor not found")

        parsed = ServiceCreate(**json.loads(form_data))
        image_meta_list = json.loads(image_meta)

        service = Service(
            vendor_id=vendor_id,
            service_type=parsed.service_type,
            service_name=parsed.service_name,
            description=parsed.description,
            add_line1=parsed.add_line1,
            add_line2=parsed.add_line2,
            area=parsed.area,
            city=parsed.city,
            state=parsed.state,
            country=parsed.country,
            pincode=parsed.pincode,
            latitude=parsed.latitude,
            longitude=parsed.longitude,
            metadata_=parsed.metadata_.dict() if parsed.metadata_ else {},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(service)
        await db.flush()

        # variants
        parsed.variants = enforce_variants(parsed.variants)

        for v in parsed.variants:
            db.add(ServiceVariant(service_id=service.id, **v.dict()))

        # media
        display_order = 0

        for idx, img in enumerate(images):
            url = await upload_file(img)

            meta = image_meta_list[idx] if idx < len(image_meta_list) else {}

            db.add(ServiceMedia(
                service_id=service.id,
                media_url=url,
                media_type=meta.get("media_type", "image"),
                source_type="upload",
                is_cover=meta.get("is_cover", False),
                display_order=meta.get("display_order", display_order),
                metadata_={}
            ))

            display_order += 1

        for vid in videos:
            url = await upload_file(vid)

            db.add(ServiceMedia(
                service_id=service.id,
                media_url=url,
                media_type="video",
                source_type="upload",
                is_cover=False,
                display_order=display_order,
                metadata_={}
            ))
            display_order += 1

        external_list = json.loads(external_media)

        for item in external_list:
            db.add(ServiceMedia(
                service_id=service.id,
                media_url=item["media_url"],
                media_type=item.get("media_type", "image"),
                source_type="external",
                is_cover=False,
                display_order=display_order,
                metadata_=item.get("metadata", {})
            ))
            display_order += 1

        await db.commit()

        return ServiceCreateResponse(
            message="Service created successfully",
            service_id=service.id
        )

    # ───────── GET ALL ─────────
    @staticmethod
    async def get_all(db, email):
        vendor_id = await ServicesController.get_vendor_id(db, email)
        result = await db.execute(get_vendor_services(vendor_id))
        return result.scalars().unique().all()

    # ───────── GET ONE ─────────
    @staticmethod
    async def get_one(db, service_id, email):
        vendor_id = await ServicesController.get_vendor_id(db, email)
        result = await db.execute(get_service_by_id(service_id, vendor_id))
        return result.unique().scalar_one_or_none()

    # ───────── UPDATE ─────────
    @staticmethod
    async def update(db, service_id, email, form_data):
        vendor_id = await ServicesController.get_vendor_id(db, email)

        result = await db.execute(get_service_by_id(service_id, vendor_id))
        service = result.unique().scalar_one_or_none()

        if not service:
            return None

        parsed = ServiceCreate(**json.loads(form_data))

        for field, value in parsed.dict().items():
            setattr(service, field, value)

        service.updated_at = datetime.utcnow()

        await db.execute(delete(ServiceVariant).where(ServiceVariant.service_id == service_id))

        parsed.variants = enforce_variants(parsed.variants)

        for v in parsed.variants:
            db.add(ServiceVariant(service_id=service_id, **v.dict()))

        await db.commit()
        return service

    # ───────── DELETE ─────────
    @staticmethod
    async def delete(db, service_id, email):
        vendor_id = await ServicesController.get_vendor_id(db, email)

        await db.execute(
            delete(Service).where(
                Service.id == service_id,
                Service.vendor_id == vendor_id
            )
        )

        await db.commit()