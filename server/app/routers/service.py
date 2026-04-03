from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select, delete
import mimetypes
import json
import logging

from app.Db.db import get_db
from app.models.models import Vendor, Service, Venue, ServiceVariant, UnavailableDate, ServiceMedia
from app.Dependencies.Auth import get_current_user
from app.utils.supabase_client import supabase
from app.schemas.services import ServiceCreate, ServiceResponse, ServiceCreateResponse

servicerouter = APIRouter(prefix="/services", tags=["services"])
logger = logging.getLogger(__name__)


# ========================= CREATE =========================
@servicerouter.post("/create", response_model=ServiceCreateResponse, status_code=201)
async def create_service(
    data: str = Form(...),
    images: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        if current_user.get("role") != "vendor":
            raise HTTPException(status_code=403, detail="Vendor role required")

        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()

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
            metadata_=parsed.metadata_ or {},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(db_service)
        await db.flush()

        # Venue
        if parsed.venue:
            db.add(Venue(
                service_id=db_service.id,
                venue_type=parsed.venue.venue_type,
                venue_nature=parsed.venue.venue_nature,
                min_capacity=parsed.venue.min_capacity,
                max_capacity=parsed.venue.max_capacity,
                square_feet=parsed.venue.square_feet,
                parking_capacity=parsed.venue.parking_capacity,
                catering_options=parsed.venue.catering_options or {},
                amenities=parsed.venue.amenities or [],
                venue_rules=parsed.venue.venue_rules or []
            ))

        # Enforce Variant Integrity (Exactly 1 Default required)
        if not parsed.variants:
            from app.schemas.services import ServiceVariantCreate
            parsed.variants = [ServiceVariantCreate(
                variant_name="Basic Package",
                pricing_type="BASE_PRICE",
                pricing={"base_price": 0},
                is_default=True
            )]
        else:
            default_count = sum(1 for v in parsed.variants if v.is_default)
            if default_count == 0:
                parsed.variants[0].is_default = True
            elif default_count > 1:
                first_found = False
                for v in parsed.variants:
                    if v.is_default:
                        if not first_found:
                            first_found = True
                        else:
                            v.is_default = False

        # Apply Variants
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

        # Images
        for idx, img in enumerate(images):
            file_bytes = await img.read()
            ext = img.filename.split(".")[-1] if "." in img.filename else "bin"
            file_path = f"services/{uuid4().hex}.{ext}"

            content_type, _ = mimetypes.guess_type(img.filename)
            content_type = content_type or "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )

            public_url = supabase.storage.from_("service-images").get_public_url(file_path)
            url = public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)

            db.add(ServiceMedia(
                service_id=db_service.id,
                media_url=url,
                media_type="image",
                is_cover=(idx == 0),
                display_order=idx,
                metadata_={}
            ))

        await db.commit()
        return ServiceCreateResponse(message="Service created", service_id=db_service.id)

    except Exception as e:
        await db.rollback()
        logger.exception("Create failed")
        raise HTTPException(status_code=500, detail=str(e))


# ========================= GET ALL =========================
@servicerouter.get("/get-all", response_model=List[ServiceResponse])
async def get_all_services(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        if current_user.get("role") != "vendor":
            raise HTTPException(status_code=403, detail="Vendor role required")

        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()

        result = await db.execute(
            select(Service)
            .filter(Service.vendor_id == vendor_id)
            .options(
                joinedload(Service.venue),
                joinedload(Service.variants),
                joinedload(Service.media),
                joinedload(Service.unavailable_dates)
            )
        )

        services = result.scalars().unique().all()

        response = []

        for s in services:
            venue = s.venue

            venue_data = None
            if venue:
                venue_data = {
                    **venue.__dict__,
                    "amenities": (
                        list(venue.amenities.values())
                        if isinstance(venue.amenities, dict)
                        else (venue.amenities or [])
                    ),
                    "venue_rules": (
                        list(venue.venue_rules.values())
                        if isinstance(venue.venue_rules, dict)
                        else (venue.venue_rules or [])
                    )
                }

            response.append(ServiceResponse(
                id=s.id,
                vendor_id=s.vendor_id,
                service_type=s.service_type,
                service_name=s.service_name,
                description=s.description,
                add_line1=s.add_line1,
                add_line2=s.add_line2,
                area=s.area,
                city=s.city,
                state=s.state,
                country=s.country,
                pincode=s.pincode,
                latitude=s.latitude,
                longitude=s.longitude,
                status=s.status,
                is_active=s.is_active,
                is_verified=s.is_verified,
                metadata=s.metadata_ or {},
                created_at=s.created_at,
                updated_at=s.updated_at,

                venue=venue_data,

                variants=[
                    {
                        **v.__dict__,
                        "menu": (
                            list(v.menu.values())
                            if isinstance(v.menu, dict)
                            else (v.menu or [])
                        ),
                        "deliverables": (
                            list(v.deliverables.values())
                            if isinstance(v.deliverables, dict)
                            else (v.deliverables or [])
                        ),
                        "metadata": v.metadata_ or {}
                    }
                    for v in s.variants
                ],

                media=[
                    {
                        **m.__dict__,
                        "metadata": m.metadata_ or {}
                    }
                    for m in s.media
                ],

                unavailable_dates=s.unavailable_dates
            ))

        return response

    except Exception as e:
        logger.exception("Fetch failed")
        raise HTTPException(status_code=500, detail=str(e))


# ========================= UPDATE =========================
@servicerouter.put("/update/{id}", response_model=ServiceCreateResponse)
async def update_service(
    id: int,
    data: str = Form(...),
    existing_images: str = Form("[]"),
    images: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()

        result = await db.execute(
            select(Service)
            .filter(Service.id == id, Service.vendor_id == vendor_id)
            .options(joinedload(Service.venue), joinedload(Service.variants), joinedload(Service.media))
        )
        db_service = result.unique().scalar_one_or_none()

        if not db_service:
            raise HTTPException(status_code=404, detail="Not found")

        parsed = ServiceCreate(**json.loads(data))
        existing_imgs = json.loads(existing_images)

        # Core
        for field in ["service_name","service_type","description","add_line1","add_line2","area","city","state","country","pincode","latitude","longitude"]:
            setattr(db_service, field, getattr(parsed, field))
        db_service.metadata_ = parsed.metadata_ or {}
        db_service.updated_at = datetime.utcnow()

        # Venue
        if parsed.venue:
            if db_service.venue:
                for field, value in parsed.venue.dict().items():
                    setattr(db_service.venue, field, value)
            else:
                db.add(Venue(service_id=id, **parsed.venue.dict())) 

        # Variants (reset)
        await db.execute(delete(ServiceVariant).where(ServiceVariant.service_id == id))
        
        # Enforce Variant Integrity (Exactly 1 Default required)
        if not parsed.variants:
            from app.schemas.services import ServiceVariantCreate
            parsed.variants = [ServiceVariantCreate(
                variant_name="Basic Package",
                pricing_type="BASE_PRICE",
                pricing={"base_price": 0},
                is_default=True
            )]
        else:
            default_count = sum(1 for v in parsed.variants if v.is_default)
            if default_count == 0:
                parsed.variants[0].is_default = True
            elif default_count > 1:
                first_found = False
                for v in parsed.variants:
                    if v.is_default:
                        if not first_found:
                            first_found = True
                        else:
                            v.is_default = False
        
        for v in parsed.variants:
            db.add(ServiceVariant(
                service_id=id,
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

        # Media delete
        for m in db_service.media:
            if m.media_url not in existing_imgs:
                await db.execute(delete(ServiceMedia).where(ServiceMedia.id == m.id))

        # Upload new
        start = len(existing_imgs)
        for idx, img in enumerate(images):
            file_bytes = await img.read()
            ext = img.filename.split(".")[-1] if "." in img.filename else "jpg"
            file_path = f"services/{uuid4().hex}.{ext}"

            import mimetypes
            content_type, _ = mimetypes.guess_type(img.filename)
            content_type = content_type or "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )

            public_url = supabase.storage.from_("service-images").get_public_url(file_path)
            url = public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)

            db.add(ServiceMedia(
                service_id=id,
                media_url=str(url),
                media_type="image",
                is_cover=(start + idx == 0),
                display_order=start + idx,
                metadata_={}
            ))

        await db.commit()
        return ServiceCreateResponse(message="Updated", service_id=id)

    except Exception as e:
        await db.rollback()
        logger.exception("Update failed")
        raise HTTPException(status_code=500, detail=str(e))


# ========================= DELETE =========================
@servicerouter.delete("/delete/{id}", status_code=204)
async def delete_service(id: int, db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(delete(Service).where(Service.id == id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========================= UNAVAILABLE =========================
@servicerouter.post("/{service_id}/unavailable-dates")
async def add_unavailable_date(
    service_id: int,
    start_date: str = Form(...),
    end_date: str = Form(...),
    reason: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
    end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    db.add(UnavailableDate(service_id=service_id, start_date=start, end_date=end, reason=reason))
    await db.commit()

    return {"message": "Added"}


@servicerouter.delete("/{service_id}/unavailable-dates/{date_id}")
async def remove_unavailable_date(
    service_id: int,
    date_id: int,
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(UnavailableDate).where(
        UnavailableDate.id == date_id,
        UnavailableDate.service_id == service_id
    ))
    await db.commit()
    return {"message": "Removed"}