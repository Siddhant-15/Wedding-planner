from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.infrastructure.db.models.models import (
    Service,
    ServiceVariant,
    ServiceVersion,
    ServiceMedia,
    Vendor,
    Venue,
    Catering,
    Dj,
    Photography,
    EventManagement,
    MakeupArtist,
)

from app.schemas.Vendor.vendor_services import (
    ServiceCreate,
    ServiceCreateResponse,
    ServiceUpdate,
    ServiceResponse
)

from app.core.security import (
    validate_external_url,
)

from app.utils.Vendor.variants import (
    enforce_variants,
)

from app.repositories.Vendor.services_queries import (
    get_service_by_id,
    get_vendor_services,
)

from app.services.Vendor.media_pipeline import (
    upload_media_files,
)

from app.infrastructure.storage.interface import (
    AbstractStorageBackend,
)


class ServicesController:

    # ─────────────────────────────────────────────────────────────
    # GET VENDOR ID
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def get_vendor_id(
        db: AsyncSession,
        email: str,
    ) -> Optional[int]:

        result = await db.execute(
            select(Vendor.id).where(
                Vendor.email == email
            )
        )

        return result.scalar_one_or_none()

    # ─────────────────────────────────────────────────────────────
    # TYPE SPECIFIC DETAILS
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def add_type_specific_details(
        db: AsyncSession,
        service_id: int,
        parsed: ServiceCreate | ServiceUpdate,
    ):

        stype = parsed.service_type

        # ───────────────── VENUE ─────────────────

        if stype == "venue" and parsed.venue:

            v = parsed.venue

            db.add(
                Venue(
                    service_id=service_id,

                    venue_type=v.venue_type,

                    venue_nature=v.venue_nature,

                    max_capacity=v.max_capacity,

                    min_capacity=v.min_capacity,

                    square_feet=v.square_feet,

                    parking_capacity=v.parking_capacity,

                    venue_policies=(
                        v.venue_policies.model_dump(mode="json")
                        if v.venue_policies
                        else {}
                    ),
                )
            )

        # ───────────────── CATERING ─────────────────

        elif stype == "catering" and parsed.catering:

            c = parsed.catering

            db.add(
                Catering(
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

                    special_diets_supported=(
                        c.special_diets_supported or []
                    ),

                    customizable_menu=c.customizable_menu,
                )
            )

        # ───────────────── DJ ─────────────────

        elif stype == "dj" and parsed.dj:

            d = parsed.dj

            db.add(
                Dj(
                    service_id=service_id,

                    genres_supported=d.genres_supported or [],

                    languages_supported=d.languages_supported or [],

                    event_types_supported=(
                        d.event_types_supported
                        or ["wedding"]
                    ),

                    performance_duration_hours=(
                        d.performance_duration_hours
                    ),

                    overtime_rate_per_hour=(
                        d.overtime_rate_per_hour
                    ),

                    equipments_provided=(
                        d.equipments_provided or []
                    ),

                    sound_system_included=(
                        d.sound_system_included
                    ),

                    lighting_included=d.lighting_included,

                    smoke_machine_included=(
                        d.smoke_machine_included
                    ),

                    led_wall_included=d.led_wall_included,

                    mc_host_available=d.mc_host_available,

                    crowd_interaction_level=(
                        d.crowd_interaction_level
                    ),

                    setup_time_minutes=d.setup_time_minutes,

                    teardown_time_minutes=(
                        d.teardown_time_minutes
                    ),

                    power_requirement_kw=(
                        d.power_requirement_kw
                    ),

                    backup_power_required=(
                        d.backup_power_required
                    ),

                    travel_cost_per_km=(
                        d.travel_cost_per_km
                    ),

                    base_city=d.base_city,

                    outdoor_supported=d.outdoor_supported,

                    late_night_allowed=(
                        d.late_night_allowed
                    ),

                    sound_license_required=(
                        d.sound_license_required
                    ),

                    custom_playlist_allowed=(
                        d.custom_playlist_allowed
                    ),

                    playlist_link_supported=(
                        d.playlist_link_supported
                    ),

                    experience_years=d.experience_years,
                )
            )

        # ───────────────── PHOTOGRAPHY ─────────────────

        elif (
            stype == "photography"
            and parsed.photography
        ):

            p = parsed.photography

            db.add(
                Photography(
                    service_id=service_id,

                    photography_types=(
                        p.photography_types or []
                    ),

                    videography_available=(
                        p.videography_available
                    ),

                    drone_shoot_available=(
                        p.drone_shoot_available
                    ),

                    photo_delivery_count=(
                        p.photo_delivery_count
                    ),

                    video_delivery_duration_minutes=(
                        p.video_delivery_duration_minutes
                    ),

                    edited_photos_included=(
                        p.edited_photos_included
                    ),

                    raw_photos_provided=(
                        p.raw_photos_provided
                    ),

                    album_included=p.album_included,

                    album_pages=p.album_pages,

                    coverage_hours=p.coverage_hours,

                    overtime_rate_per_hour=(
                        p.overtime_rate_per_hour
                    ),

                    team_size=p.team_size,

                    second_shooter_included=(
                        p.second_shooter_included
                    ),

                    editing_styles=(
                        p.editing_styles or []
                    ),

                    travel_cost_per_km=(
                        p.travel_cost_per_km
                    ),

                    base_city=p.base_city,

                    experience_years=(
                        p.experience_years
                    ),
                )
            )

        # ───────────────── EVENT MANAGEMENT ─────────────────

        elif (
            stype == "event_management"
            and parsed.event_management
        ):

            em = parsed.event_management

            db.add(
                EventManagement(
                    service_id=service_id,

                    event_types_supported=(
                        em.event_types_supported or []
                    ),

                    services_offered=(
                        em.services_offered or []
                    ),

                    themes_supported=(
                        em.themes_supported or []
                    ),

                    team_size=em.team_size,

                    on_site_managers=(
                        em.on_site_managers
                    ),

                    decoration_included=(
                        em.decoration_included
                    ),

                    catering_management=(
                        em.catering_management
                    ),

                    entertainment_management=(
                        em.entertainment_management
                    ),

                    planning_duration_days=(
                        em.planning_duration_days
                    ),

                    setup_time_hours=(
                        em.setup_time_hours
                    ),

                    min_budget=em.min_budget,

                    max_budget=em.max_budget,

                    travel_cost_per_km=(
                        em.travel_cost_per_km
                    ),

                    base_city=em.base_city,

                    experience_years=(
                        em.experience_years
                    ),
                )
            )

        # ───────────────── MAKEUP ARTIST ─────────────────

        elif (
            stype == "makeup_artist"
            and parsed.makeup_artist
        ):

            ma = parsed.makeup_artist

            db.add(
                MakeupArtist(
                    service_id=service_id,

                    makeup_types=(
                        ma.makeup_types or []
                    ),

                    specialization=(
                        ma.specialization or []
                    ),

                    brands_used=(
                        ma.brands_used or []
                    ),

                    premium_products_used=(
                        ma.premium_products_used
                    ),

                    team_size=ma.team_size,

                    service_duration_minutes=(
                        ma.service_duration_minutes
                    ),

                    travel_to_client=(
                        ma.travel_to_client
                    ),

                    travel_cost_per_km=(
                        ma.travel_cost_per_km
                    ),

                    base_city=ma.base_city,

                    hairstyling_included=(
                        ma.hairstyling_included
                    ),

                    draping_included=(
                        ma.draping_included
                    ),

                    trial_available=(
                        ma.trial_available
                    ),

                    experience_years=(
                        ma.experience_years
                    ),
                )
            )

    # ─────────────────────────────────────────────────────────────
    # CREATE SERVICE
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def create(
        db: AsyncSession,

        current_user,

        parsed: ServiceCreate,

        media: list,

        idempotency_key: str,
    ):

        if current_user["role"] != "vendor":

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vendor role required",
            )

        vendor_id = current_user["id"]

        now = datetime.now(timezone.utc)

        try:

            # ───────────────── SERVICE ─────────────────

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

                metadata_=(
                    parsed.metadata_.model_dump()
                    if parsed.metadata_
                    else {}
                ),

                status="pending_review",

                is_active=False,

                is_verified=False,

                created_at=now,

                updated_at=now,
            )

            db.add(service)

            await db.flush()

            # ───────────────── TYPE SPECIFIC ─────────────────

            await ServicesController.add_type_specific_details(
                db=db,
                service_id=service.id,
                parsed=parsed,
            )

            # ───────────────── VERSION ─────────────────

            version = ServiceVersion(
                service_id=service.id,

                version_number=1,

                state="pending_review",

                snapshot=parsed.model_dump(
                    mode="json"
                ),

                submitted_at=now,

                created_by=vendor_id,

                created_at=now,

                updated_at=now,
            )

            db.add(version)

            await db.flush()

            service.pending_version_id = version.id

            # ───────────────── VARIANTS ─────────────────

            parsed.variants = enforce_variants(
                parsed.variants
            )

            for variant in parsed.variants:

                db.add(
                    ServiceVariant(
                        service_id=service.id,

                        variant_name=variant.variant_name,

                        description=variant.description,

                        min_quantity=variant.min_quantity,

                        max_quantity=variant.max_quantity,

                        pricing_type=variant.pricing_type,

                        currency=variant.currency,

                        pricing=variant.pricing or {},

                        menu=variant.menu or [],

                        deliverables=(
                            variant.deliverables or []
                        ),

                        inclusions=(
                            variant.inclusions or []
                        ),

                        exclusions=(
                            variant.exclusions or []
                        ),

                        policies=variant.policies or {},

                        metadata_=(
                            variant.metadata_ or {}
                        ),

                        is_default=variant.is_default,

                        is_active=True,

                        created_at=now,

                        updated_at=now,
                    )
                )

            # ───────────────── MEDIA ─────────────────

            allowed_media_types = {
                "image",
                "video",
                "youtube",
                "vimeo",
            }

            for item in media:

                media_url = item.get("media_url")

                media_type = item.get("media_type")

                source_type = item.get(
                    "source_type",
                    "external",
                )

                if not media_url:

                    raise HTTPException(
                        status_code=400,
                        detail="media_url required",
                    )

                validate_external_url(media_url)

                if media_type not in allowed_media_types:

                    raise HTTPException(
                        status_code=400,
                        detail="Invalid media type",
                    )

                db.add(
                    ServiceMedia(
                        service_id=service.id,

                        media_url=media_url,

                        media_type=media_type,

                        source_type=source_type,

                        is_cover=item.get(
                            "is_cover",
                            False,
                        ),

                        display_order=item.get(
                            "display_order",
                            0,
                        ),

                        metadata_=item.get(
                            "metadata_",
                            {},
                        ),
                    )
                )

            await db.commit()

            await db.refresh(service)

            return ServiceCreateResponse(
                service_id=service.id,

                moderation_status="pending_review",

                message=(
                    "Service submitted "
                    "for admin review"
                ),
            )

        except IntegrityError:

            await db.rollback()

            raise HTTPException(
                status_code=409,
                detail="Duplicate service data",
            )

        except HTTPException:
            raise

        except Exception as e:

            await db.rollback()

            raise HTTPException(
                status_code=500,
                detail=str(e),
            )

    # ─────────────────────────────────────────────────────────────
    # GET ALL SERVICES
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def get_all(
        db: AsyncSession,
        email: str,
    ):

        vendor_id = (
            await ServicesController.get_vendor_id(
                db,
                email,
            )
        )

        if not vendor_id:

            raise HTTPException(
                status_code=404,
                detail="Vendor not found",
            )

        result = await db.execute(
            get_vendor_services(vendor_id)
        )

        services = result.scalars().unique().all()

        return [
            ServiceResponse.model_validate(
                service,
                from_attributes=True,
            )
            for service in services
        ]

    # ─────────────────────────────────────────────────────────────
    # GET ONE SERVICE
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def get_one(
        db: AsyncSession,
        service_id: int,
        email: str,
    ):

        vendor_id = (
            await ServicesController.get_vendor_id(
                db,
                email,
            )
        )

        result = await db.execute(
            get_service_by_id(
                service_id,
                vendor_id,
            )
        )

        service = result.unique().scalar_one_or_none()

        if not service:

            raise HTTPException(
                status_code=404,
                detail="Service not found",
            )

        return ServiceResponse.model_validate(
            service,
            from_attributes=True,
        )

    # ─────────────────────────────────────────────────────────────
    # UPDATE SERVICE
    # ─────────────────────────────────────────────────────────────
    @staticmethod
    async def update(
        db: AsyncSession,

        service_id: int,

        current_user,

        parsed: ServiceUpdate,

        media: list,

        idempotency_key: str,
    ):

        vendor_id = current_user.vendor_id

        result = await db.execute(
            get_service_by_id(
                service_id,
                vendor_id,
            )
        )

        service = result.unique().scalar_one_or_none()

        if not service:

            raise HTTPException(
                status_code=404,
                detail="Service not found",
            )

        try:

            now = datetime.now(timezone.utc)

            # ─────────────────────────────────────────────
            # UPDATE CORE SERVICE
            # ─────────────────────────────────────────────

            update_data = parsed.model_dump(
                exclude_unset=True,
                by_alias=True,
            )

            for field, value in update_data.items():

                # variants handled separately
                if field == "variants":
                    continue

                # type-specific handled separately
                if field in {
                    "venue",
                    "catering",
                    "dj",
                    "photography",
                    "event_management",
                    "makeup_artist",
                }:
                    continue

                if field == "metadata":

                    setattr(
                        service,
                        "metadata_",
                        value,
                    )

                else:

                    setattr(
                        service,
                        field,
                        value,
                    )

            service.updated_at = now

            service.status = "draft_update"

            service.is_active = False

            # ─────────────────────────────────────────────
            # TYPE SPECIFIC UPDATE
            # ─────────────────────────────────────────────

            await ServicesController.upsert_type_specific_data(
                db=db,
                service=service,
                parsed=parsed,
            )

            # ─────────────────────────────────────────────
            # VARIANTS
            # ─────────────────────────────────────────────

            if parsed.variants is not None:

                await db.execute(
                    delete(ServiceVariant).where(
                        ServiceVariant.service_id
                        == service_id
                    )
                )

                parsed.variants = enforce_variants(
                    parsed.variants
                )

                for variant in parsed.variants:

                    db.add(
                        ServiceVariant(
                            service_id=service_id,

                            variant_name=(
                                variant.variant_name
                            ),

                            description=(
                                variant.description
                            ),

                            min_quantity=(
                                variant.min_quantity
                            ),

                            max_quantity=(
                                variant.max_quantity
                            ),

                            pricing_type=(
                                variant.pricing_type
                            ),

                            currency=variant.currency,

                            pricing=(
                                variant.pricing or {}
                            ),

                            menu=variant.menu or [],

                            deliverables=(
                                variant.deliverables
                                or []
                            ),

                            inclusions=(
                                variant.inclusions
                                or []
                            ),

                            exclusions=(
                                variant.exclusions
                                or []
                            ),

                            policies=(
                                variant.policies
                                or {}
                            ),

                            metadata_=(
                                variant.metadata_
                                or {}
                            ),

                            is_default=(
                                variant.is_default
                            ),

                            is_active=True,

                            created_at=now,

                            updated_at=now,
                        )
                    )

            # ─────────────────────────────────────────────
            # MEDIA
            # ─────────────────────────────────────────────

            if media is not None:

                await db.execute(
                    delete(ServiceMedia).where(
                        ServiceMedia.service_id
                        == service_id
                    )
                )

                for item in media:

                    media_url = item.get(
                        "media_url"
                    )

                    media_type = item.get(
                        "media_type"
                    )

                    source_type = item.get(
                        "source_type",
                        "external",
                    )

                    if not media_url:

                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "media_url required"
                            ),
                        )

                    validate_external_url(
                        media_url
                    )

                    allowed_media_types = {
                        "image",
                        "video",
                        "youtube",
                        "vimeo",
                    }

                    if (
                        media_type
                        not in allowed_media_types
                    ):

                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "Invalid media type"
                            ),
                        )

                    db.add(
                        ServiceMedia(
                            service_id=service_id,

                            media_url=media_url,

                            media_type=media_type,

                            source_type=source_type,

                            is_cover=item.get(
                                "is_cover",
                                False,
                            ),

                            display_order=item.get(
                                "display_order",
                                0,
                            ),

                            metadata_=item.get(
                                "metadata_",
                                {},
                            ),
                        )
                    )

            # ─────────────────────────────────────────────
            # CREATE NEW VERSION SNAPSHOT
            # ─────────────────────────────────────────────

            latest_version_result = await db.execute(
                select(ServiceVersion)
                .where(
                    ServiceVersion.service_id
                    == service_id
                )
                .order_by(
                    ServiceVersion.version_number.desc()
                )
                .limit(1)
            )

            latest_version = (
                latest_version_result
                .scalar_one_or_none()
            )

            next_version = (
                latest_version.version_number + 1
                if latest_version
                else 1
            )

            service_version = ServiceVersion(
                service_id=service.id,

                version_number=next_version,

                state="pending_review",

                snapshot=parsed.model_dump(
                    mode="json"
                ),

                submitted_at=now,

                created_by=vendor_id,

                created_at=now,

                updated_at=now,
            )

            db.add(service_version)

            await db.flush()

            service.pending_version_id = (
                service_version.id
            )

            await db.commit()

            await db.refresh(service)

            return ServiceCreateResponse(
                service_id=service.id,

                moderation_status="pending_review",

                message=(
                    "Updated service submitted "
                    "for moderation"
                ),
            )

        except HTTPException:
            raise

        except Exception as e:

            await db.rollback()

            raise HTTPException(
                status_code=500,
                detail=str(e),
            )
    
    # ─────────────────────────────────────────────────────────────
    # DELETE SERVICE
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    async def delete(
        db: AsyncSession,
        service_id: int,
        email: str,
    ):

        vendor_id = (
            await ServicesController.get_vendor_id(
                db,
                email,
            )
        )

        result = await db.execute(
            get_service_by_id(
                service_id,
                vendor_id,
            )
        )

        service = result.unique().scalar_one_or_none()

        if not service:

            raise HTTPException(
                status_code=404,
                detail="Service not found",
            )

        await db.delete(service)

        await db.commit()

        return {
            "message": (
                "Service deleted successfully"
            ),
        }