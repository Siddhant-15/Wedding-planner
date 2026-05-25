import json
import logging
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.future import select

from app.models.models import (
    Vendor,
    Service,
    ServiceVariant,
    ServiceMedia
)

from app.schemas.services import (
    ServiceCreate,
    ServiceCreateResponse
)

from app.repositories.service_repository import (
    get_service_with_relations,
    get_all_vendor_services
)

from app.utils.service_helpers import (
    _add_type_specific,
    _update_type_specific,
    _enforce_variants,
    _build_service_response
)

from app.utils.media_utils import _upload_media

logger = logging.getLogger(__name__)


async def create_service_controller(
    data,
    images,
    external_media,
    db,
    current_user
):
    try:
        if current_user.get("role") != "vendor":
            raise HTTPException(status_code=403, detail="Vendor role required")

        vendor_res = await db.execute(
            select(Vendor.id).where(Vendor.email == current_user["email"])
        )

        vendor_id = vendor_res.scalar_one_or_none()

        if not vendor_id:
            raise HTTPException(status_code=404, detail="Vendor not found")

        parsed = ServiceCreate(**json.loads(data))

        db_service = Service(
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

        db.add(db_service)
        await db.flush()

        _add_type_specific(db, db_service.id, parsed)

        parsed.variants = _enforce_variants(parsed.variants)

        for v in parsed.variants:
            db.add(ServiceVariant(
                service_id=db_service.id,
                variant_name=v.variant_name,
                description=v.description,
                min_quantity=v.min_quantity,
                max_quantity=v.max_quantity,
                pricing_type=v.pricing_type,
                currency=v.currency,
                pricing=v.pricing or {},
                menu=v.menu or [],
                deliverables=v.deliverables or [],
                inclusions=v.inclusions or [],
                exclusions=v.exclusions or [],
                policies=v.policies or {},
                metadata_=v.metadata_ or {},
                is_default=v.is_default
            ))

        display_order = 0

        for img in images:
            url = await _upload_media(img)

            db.add(ServiceMedia(
                service_id=db_service.id,
                media_url=url,
                media_type="image",
                source_type="upload",
                is_cover=(display_order == 0),
                display_order=display_order,
                metadata_={}
            ))

            display_order += 1

        for video in videos:
            url = await _upload_media(video)

            db.add(ServiceMedia(
                service_id=db_service.id,
                media_url=url,
                media_type="video",
                source_type="upload",
                is_cover=False,
                display_order=display_order,
                metadata_={}
            ))

            display_order += 1

        external_media_list = json.loads(external_media)

        for item in external_media_list:
            db.add(ServiceMedia(
                service_id=db_service.id,
                media_url=item["media_url"],
                media_type=item.get("media_type", "image"),
                source_type=item.get("source_type", "external"),
                is_cover=False,
                display_order=display_order,
                metadata_=item.get("metadata", {})
            ))

            display_order += 1

        await db.commit()

        return ServiceCreateResponse(
            message="Service created successfully",
            service_id=db_service.id
        )

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()
        logger.exception("Create service failed")
        raise HTTPException(status_code=500, detail=str(e))


async def get_all_services_controller(db, current_user):
    services = await get_all_vendor_services(db, current_user)
    return [_build_service_response(s) for s in services]


async def get_service_controller(id, db, current_user):
    db_service = await get_service_with_relations(id, db, current_user)

    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    return _build_service_response(db_service)


async def update_service_controller(
    id,
    data,
    existing_media,
    images,
    videos,
    external_media,
    db,
    current_user
):
    # MOVE YOUR EXISTING UPDATE LOGIC HERE
    pass


async def delete_service_controller(id, db, current_user):
    # MOVE YOUR EXISTING DELETE LOGIC HERE
    pass