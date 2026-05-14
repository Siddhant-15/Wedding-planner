from app.Db import db
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
from app.models.models import (
    Vendor, Service, Venue, Catering, Dj, Photography,
    EventManagement, MakeupArtist, ServiceVariant, ServiceMedia
)
from app.Dependencies.Auth import get_current_user
from app.utils.supabase_client import supabase
from app.schemas.services import (
    ServiceCreate, ServiceResponse, ServiceCreateResponse, ServiceVariantCreate
)

servicerouter = APIRouter(prefix="/services", tags=["services"])
logger = logging.getLogger(__name__)


# ─── Helpers ────────────────────────────────────────────────────────────────

def _enforce_variants(variants: List[ServiceVariantCreate]) -> List[ServiceVariantCreate]:
    """Ensure exactly one default variant exists."""
    if not variants:
        return [ServiceVariantCreate(
            variant_name="Basic Package",
            pricing_type="BASE_PRICE",
            pricing={"base_price": 0},
            is_default=True
        )]
    default_count = sum(1 for v in variants if v.is_default)
    if default_count == 0:
        variants[0].is_default = True
    elif default_count > 1:
        found = False
        for v in variants:
            if v.is_default:
                if found:
                    v.is_default = False
                else:
                    found = True
    return variants


def _add_type_specific(db, service_id: int, parsed: ServiceCreate):
    """Add the type-specific detail record for a service."""
    stype = parsed.service_type

    if stype == "venue" and parsed.venue:
        vp = parsed.venue.venue_policies or {}

        venue_policies = {
            "decoration_policy": vp.get("decoration_policy", ""),
            "catering_policy": vp.get("catering_policy", ""),
            "alcohol_policy": vp.get("alcohol_policy", ""),
            "other_policies": vp.get("other_policies", [])
        }

        db.add(Venue(
            service_id=service_id,
            venue_type=parsed.venue.venue_type,
            venue_nature=parsed.venue.venue_nature,
            min_capacity=parsed.venue.min_capacity,
            max_capacity=parsed.venue.max_capacity,
            square_feet=parsed.venue.square_feet,
            parking_capacity=parsed.venue.parking_capacity,

            venue_policies=venue_policies
        ))

    elif stype == "catering" and parsed.catering:
        c = parsed.catering
        db.add(Catering(
            service_id=service_id,
            cuisine_types=c.cuisine_types or [],
            meal_types=c.meal_types or [],
            veg_price_per_head=c.veg_price_per_head,
            non_veg_price_per_head=c.non_veg_price_per_head,
            min_order=c.min_order,
            max_order=c.max_order,
            service_styles=c.service_styles or [],
            staff_included=c.staff_included,
            crockery_cutlery_included=c.crockery_cutlery_included,
            tasting_available=c.tasting_available,
            setup_time_minutes=c.setup_time_minutes,
            service_duration_minutes=c.service_duration_minutes,
            travel_cost_per_km=c.travel_cost_per_km,
            base_city=c.base_city,
            gst_percentage=c.gst_percentage,
            price_includes_tax=c.price_includes_tax,
            special_diets_supported=c.special_diets_supported or [],
            customizable_menu=c.customizable_menu
        ))

    elif stype == "dj" and parsed.dj:
        d = parsed.dj
        db.add(Dj(
            service_id=service_id,
            genres_supported=d.genres_supported or [],
            languages_supported=d.languages_supported or [],
            event_types_supported = (
    d.event_types_supported if d.event_types_supported else ["wedding"]
),
            performance_duration_hours=d.performance_duration_hours,
            overtime_rate_per_hour=d.overtime_rate_per_hour,
            equipments_provided=d.equipments_provided or [],
            sound_system_included=d.sound_system_included,
            lighting_included=d.lighting_included,
            smoke_machine_included=d.smoke_machine_included,
            led_wall_included=d.led_wall_included,
            mc_host_available=d.mc_host_available,
            crowd_interaction_level=d.crowd_interaction_level,
            setup_time_minutes=d.setup_time_minutes,
            teardown_time_minutes=d.teardown_time_minutes,
            power_requirement_kw=d.power_requirement_kw,
            backup_power_required=d.backup_power_required,
            travel_cost_per_km=d.travel_cost_per_km,
            base_city=d.base_city,
            outdoor_supported=d.outdoor_supported,
            late_night_allowed=d.late_night_allowed,
            sound_license_required=d.sound_license_required,
            custom_playlist_allowed=d.custom_playlist_allowed,
            playlist_link_supported=d.playlist_link_supported,
            experience_years=d.experience_years
        ))

    elif stype == "photography" and parsed.photography:
        p = parsed.photography
        db.add(Photography(
            service_id=service_id,
            photography_types=p.photography_types or [],
            videography_available=p.videography_included,
            drone_shoot_available=p.drone_available,
            photo_delivery_count=p.photo_delivery_count,
            video_delivery_duration_minutes=p.video_delivery_duration_minutes,
            edited_photos_included=p.edited_photos_included,
            raw_photos_provided=p.raw_photos_provided,
            album_included=p.album_included,
            album_pages=p.album_pages,
            coverage_hours=p.coverage_hours,
            overtime_rate_per_hour=p.overtime_rate_per_hour,
            team_size=p.team_size,
            second_shooter_included=p.second_shooter_included,
            editing_styles=p.editing_styles or [],
            travel_cost_per_km=p.travel_cost_per_km,
            base_city=p.base_city,
            experience_years=p.experience_years
        ))

    elif stype == "event_management" and parsed.event_management:
        em = parsed.event_management
        db.add(EventManagement(
            service_id=service_id,
            event_types_supported=em.event_types or [],
            services_offered=em.services_offered or [],
            themes_supported=em.themes_supported or [],
            team_size=em.team_size,
            on_site_managers=em.on_site_managers,
            decoration_included=em.decoration_included,
            catering_management=em.catering_management,
            entertainment_management=em.entertainment_management,
            planning_duration_days=em.planning_duration_days,
            setup_time_hours=em.setup_time_hours,
            min_budget=em.min_budget,
            max_budget=em.max_budget,
            travel_cost_per_km=em.travel_cost_per_km,
            base_city=em.base_city,
            experience_years=em.experience_years
        ))

    elif stype == "makeup_artist" and parsed.makeup_artist:
        ma = parsed.makeup_artist
        db.add(MakeupArtist(
            service_id=service_id,
            makeup_types=ma.makeup_types or [],
            specialization=ma.specialization,
            brands_used=ma.brands_used or [],
            premium_products_used=ma.premium_products_used,
            team_size=ma.team_size,
            service_duration_minutes=ma.service_duration_minutes,
            travel_to_client=ma.travel_to_client,
            travel_cost_per_km=ma.travel_cost_per_km,
            base_city=ma.base_city,
            hairstyling_included=ma.hairstyling_included,
            draping_included=ma.draping_included,
            trial_available=ma.trial_available,
            experience_years=ma.experience_years
        ))


def _update_type_specific(db, db_service: Service, parsed: ServiceCreate):
    """Update or create type-specific record."""
    stype = parsed.service_type

    if stype == "venue" and parsed.venue:
        if db_service.venue:
            for k, v in parsed.venue.dict().items():
                setattr(db_service.venue, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)

    elif stype == "catering" and parsed.catering:
        if db_service.catering:
            c = parsed.catering
            for k, v in c.dict().items():
                setattr(db_service.catering, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)

    elif stype == "dj" and parsed.dj:
        if db_service.dj:
            for k, v in parsed.dj.dict().items():
                setattr(db_service.dj, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)

    elif stype == "photography" and parsed.photography:
        if db_service.photography:
            for k, v in parsed.photography.dict().items():
                setattr(db_service.photography, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)

    elif stype == "event_management" and parsed.event_management:
        if db_service.event_management:
            for k, v in parsed.event_management.dict().items():
                setattr(db_service.event_management, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)

    elif stype == "makeup_artist" and parsed.makeup_artist:
        if db_service.makeup_artist:
            for k, v in parsed.makeup_artist.dict().items():
                setattr(db_service.makeup_artist, k, v)
        else:
            _add_type_specific(db, db_service.id, parsed)


async def _upload_media(img: UploadFile) -> str:
    file_bytes = await img.read()
    ext = img.filename.split(".")[-1] if "." in img.filename else "jpg"
    file_path = f"services/{uuid4().hex}.{ext}"
    content_type, _ = mimetypes.guess_type(img.filename)
    content_type = content_type or "application/octet-stream"
    supabase.storage.from_("service-images").upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type}
    )
    public_url = supabase.storage.from_("service-images").get_public_url(file_path)
    return public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)


def _build_service_response(s: Service) -> ServiceResponse:
    def _jsonb_list(val):
        if isinstance(val, dict):
            return list(val.values())
        return val or []

    venue_data = None
    if s.venue:
        v = s.venue

        venue_data = {
            **{c.name: getattr(v, c.name) for c in v.__table__.columns},

            "venue_policies": v.venue_policies or {
                "decoration_policy": "",
                "catering_policy": "",
                "alcohol_policy": "",
                "other_policies": []
            }
        }
        
    catering_data = None
    if s.catering:
        c = s.catering
        catering_data = {
            **{col.name: getattr(c, col.name) for col in c.__table__.columns},
            "cuisine_types": _jsonb_list(c.cuisine_types),
            "meal_types": _jsonb_list(c.meal_types),
            "service_styles": _jsonb_list(c.service_styles),
            "special_diets_supported": _jsonb_list(c.special_diets_supported),
        }

    dj_data = None
    if s.dj:
        d = s.dj
        dj_data = {
            **{col.name: getattr(d, col.name) for col in d.__table__.columns},
            "genres_supported": _jsonb_list(d.genres_supported),
            "languages_supported": _jsonb_list(d.languages_supported),
            "event_types_supported": d.event_types_supported or [],
            "equipments_provided": _jsonb_list(d.equipments_provided),
        }

    photography_data = None
    if s.photography:
        p = s.photography
        photography_data = {
            **{col.name: getattr(p, col.name) for col in p.__table__.columns},
            "photography_types": _jsonb_list(p.photography_types),
            "editing_styles": _jsonb_list(p.editing_styles),
        }

    event_management_data = None
    if s.event_management:
        em = s.event_management
        event_management_data = {
            **{col.name: getattr(em, col.name) for col in em.__table__.columns},
            "event_types_supported": _jsonb_list(em.event_types_supported),
            "services_offered": _jsonb_list(em.services_offered),
            "themes_supported": _jsonb_list(em.themes_supported),
        }

    makeup_data = None
    if s.makeup_artist:
        ma = s.makeup_artist
        makeup_data = {
            **{col.name: getattr(ma, col.name) for col in ma.__table__.columns},
            "makeup_types": _jsonb_list(ma.makeup_types),
            "brands_used": _jsonb_list(ma.brands_used),
        }

    return ServiceResponse(
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
        latitude=float(s.latitude) if s.latitude else None,
        longitude=float(s.longitude) if s.longitude else None,
        status=s.status,
        is_active=s.is_active,
        is_verified=s.is_verified,
        metadata=s.metadata_ or {},
        created_at=s.created_at,
        updated_at=s.updated_at,
        venue=venue_data,
        catering=catering_data,
        dj=dj_data,
        photography=photography_data,
        event_management=event_management_data,
        makeup_artist=makeup_data,
        variants=[
            {
                **{col.name: getattr(v, col.name) for col in v.__table__.columns},
                "inclusions": v.inclusions or [],
                "exclusions": v.exclusions or [],
                "menu": _jsonb_list(v.menu),
                "deliverables": _jsonb_list(v.deliverables),
                "metadata": v.metadata_ or {},
            }
            for v in s.variants
        ],
        media=[
            {
                **{col.name: getattr(m, col.name) for col in m.__table__.columns},
                "metadata": m.metadata_ or {},
            }
            for m in s.media
        ],
        unavailable_dates=s.unavailable_dates or [],
    )


# ─── Eager Load Options ───────────────────────────────────────────────────────

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


# ─── CREATE ──────────────────────────────────────────────────────────────────

@servicerouter.post("/create", response_model=ServiceCreateResponse, status_code=201)
async def create_service(
    data: str = Form(...),
    images: List[UploadFile] = File([]),
    videos: List[UploadFile] = File([]),
    external_media: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        if current_user.get("role") != "vendor":
            raise HTTPException(status_code=403, detail="Vendor role required")

        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()
        if not vendor_id:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        print(data)
        parsed = ServiceCreate(**json.loads(data))
        print(parsed)

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

        # IMAGE UPLOADS
        for idx, img in enumerate(images):
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


        # VIDEO UPLOADS
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


        # EXTERNAL MEDIA
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
        return ServiceCreateResponse(message="Service created successfully", service_id=db_service.id)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Create service failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─── GET ALL ─────────────────────────────────────────────────────────────────

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
            .options(*_ALL_OPTS)
        )
        services = result.scalars().unique().all()
        return [_build_service_response(s) for s in services]

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Get all services failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─── GET ONE ─────────────────────────────────────────────────────────────────

@servicerouter.get("/{id}", response_model=ServiceResponse)
async def get_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()

        result = await db.execute(
            select(Service)
            .filter(Service.id == id, Service.vendor_id == vendor_id)
            .options(*_ALL_OPTS)
        )
        db_service = result.unique().scalar_one_or_none()
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        return _build_service_response(db_service)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Get service failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─── UPDATE ──────────────────────────────────────────────────────────────────

@servicerouter.put("/update/{id}", response_model=ServiceCreateResponse)
async def update_service(
    id: int,
    data: str = Form(...),
    existing_media: str = Form("[]"),
    images: List[UploadFile] = File([]),
    videos: List[UploadFile] = File([]),
    external_media: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()

        result = await db.execute(
            select(Service)
            .filter(Service.id == id, Service.vendor_id == vendor_id)
            .options(*_ALL_OPTS)
        )
        db_service = result.unique().scalar_one_or_none()
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        parsed = ServiceCreate(**json.loads(data))
        existing_media = json.loads(existing_media)

        # Core fields
        core_fields = [
            "service_name", "service_type", "description",
            "add_line1", "add_line2", "area", "city",
            "state", "country", "pincode", "latitude", "longitude"
        ]
        for field in core_fields:
            setattr(db_service, field, getattr(parsed, field))
        db_service.metadata_ = parsed.metadata_.dict() if parsed.metadata_ else {}
        db_service.updated_at = datetime.utcnow()

        # Type-specific
        _update_type_specific(db, db_service, parsed)

        # Reset & re-create variants
        await db.execute(delete(ServiceVariant).where(ServiceVariant.service_id == id))
        parsed.variants = _enforce_variants(parsed.variants)
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

        # Media: delete removed, keep existing
        for m in db_service.media:
            if m.media_url not in existing_media:
                await db.execute(delete(ServiceMedia).where(ServiceMedia.id == m.id))

        # Upload new images
        display_order = len(existing_media)

        # IMAGE UPLOADS
        for idx, img in enumerate(images):
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


        # VIDEO UPLOADS
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


        # EXTERNAL MEDIA
        external_media_urls = json.loads(external_media)

        for item in external_media_urls:
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
        return ServiceCreateResponse(message="Service updated successfully", service_id=id)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Update service failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─── DELETE ──────────────────────────────────────────────────────────────────

@servicerouter.delete("/delete/{id}", status_code=204)
async def delete_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        vendor_res = await db.execute(select(Vendor.id).where(Vendor.email == current_user["email"]))
        vendor_id = vendor_res.scalar_one_or_none()
        await db.execute(
            delete(Service).where(Service.id == id, Service.vendor_id == vendor_id)
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ─── UNAVAILABLE DATES ───────────────────────────────────────────────────────

# @servicerouter.post("/{service_id}/unavailable-dates")
# async def add_unavailable_date(
#     service_id: int,
#     start_date: str = Form(...),
#     end_date: str = Form(...),
#     reason: Optional[str] = Form(None),
#     db: AsyncSession = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     try:
#         start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
#         end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
#         if end < start:
#             raise HTTPException(status_code=400, detail="end_date must be after start_date")
#         db.add(UnavailableDate(service_id=service_id, start_date=start, end_date=end, reason=reason))
#         await db.commit()
#         return {"message": "Unavailable date added"}
#     except HTTPException:
#         raise
#     except Exception as e:
#         await db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @servicerouter.delete("/{service_id}/unavailable-dates/{date_id}")
# async def remove_unavailable_date(
#     service_id: int,
#     date_id: int,
#     db: AsyncSession = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     try:
#         await db.execute(delete(UnavailableDate).where(
#             UnavailableDate.id == date_id,
#             UnavailableDate.service_id == service_id
#         ))
#         await db.commit()
#         return {"message": "Unavailable date removed"}
#     except Exception as e:
#         await db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))