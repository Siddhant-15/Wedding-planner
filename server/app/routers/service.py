from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.database import get_db
from app.models.models import (
    Vendor, Service, VenueService, CateringService, DJService, PhotographerService, EventManagementService,
    ServiceCategory as ModelServiceCategory, PricingType as ModelPricingType,
    HallType, IndoorOutdoor, DecorationPolicy, CateringPolicy, AlcoholPolicy,
    ServiceStyle, PackageModal
)
from app.core.security import require_role
from app.utils.supabase_client import supabase
from app.schemas.services import ServiceCreateResponse, ServiceResponse, GeoPoint
import mimetypes
import json
import logging

servicerouter = APIRouter(prefix="/services", tags=["services"])
logger = logging.getLogger(__name__)


@servicerouter.post(
    "/create",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a new service (single endpoint for all categories)"
)
async def create_service(
    category: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    base_price: float = Form(...),
    pricing_type: str = Form(...),
    amenities: Optional[str] = Form(None),
    address_line1: Optional[str] = Form(None),
    address_line2: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    pincode: str = Form(...),
    geo_point: Optional[str] = Form(None),

    # category-specific fields
    capacity_min: Optional[int] = Form(None),
    capacity_max: Optional[int] = Form(None),
    hall_type: Optional[str] = Form(None),
    indoor_outdoor: Optional[str] = Form(None),
    square_feet: Optional[float] = Form(None),
    parking_capacity: Optional[int] = Form(None),
    decoration_policy: Optional[str] = Form(None),
    catering_policy: Optional[str] = Form(None),
    alcohol_policy: Optional[str] = Form(None),

    cuisine_types: Optional[str] = Form(None),
    veg_price_per_head: Optional[float] = Form(None),
    nonveg_price_per_head: Optional[float] = Form(None),
    min_order: Optional[int] = Form(None),
    max_order: Optional[int] = Form(None),
    service_style: Optional[str] = Form(None),

    genres_supported: Optional[str] = Form(None),
    duration_hours: Optional[float] = Form(None),
    equipment: Optional[str] = Form(None),

    package_type: Optional[str] = Form(None),
    hours_covered: Optional[float] = Form(None),
    photos_delivered: Optional[int] = Form(None),
    edited_photos_count: Optional[int] = Form(None),
    delivery_time_days: Optional[int] = Form(None),
    videography_included: Optional[bool] = Form(None),
    drone_available: Optional[bool] = Form(None),
    album_included: Optional[bool] = Form(None),

    event_types: Optional[str] = Form(None),
    team_size: Optional[int] = Form(None),
    includes: Optional[str] = Form(None),
    package_modal: Optional[str] = Form(None),
    vendor_network_size: Optional[int] = Form(None),
    experience_years: Optional[int] = Form(None),

    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["vendor"]))
):
    result = db.execute(
        select(Vendor.id).where(Vendor.user_id == current_user.id)
    )
    vendor_id = result.scalar()

    if not vendor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor identification failed"
        )
    # Parse JSON fields
    try:
        tags_list = json.loads(tags) if tags else []
        amenities_list = json.loads(amenities) if amenities else []
        geo_point_dict = json.loads(geo_point) if geo_point else None
        if geo_point_dict:
            geo_point_dict = GeoPoint(**geo_point_dict).dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON field: {str(e)}")

    # Validate Enums
    try:
        category_enum = ModelServiceCategory(category)
        pricing_type_enum = ModelPricingType(pricing_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check uniqueness
    existing = db.query(Service).filter(
        Service.vendor_id == vendor_id,
        Service.category == category_enum,
        Service.title == title,
        Service.city == city,
        Service.pincode == pincode
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A service with these details already exists")

    
    db_service = Service(
        vendor_id=vendor_id,
        category=category_enum,
        title=title,
        description=description,
        tags=tags_list,
        base_price=base_price,
        currency="INR",
        pricing_type=pricing_type_enum,
        amenities=amenities_list,
        address_line1=address_line1,
        address_line2=address_line2,
        area=area,
        city=city,
        state=state,
        country=country,
        pincode=pincode,
        geo_point=geo_point_dict,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        featured=False,
        verified=False,
        is_active=True,
        images=[]  # Initialize with empty list
    )

    try:
        db.add(db_service)
        db.flush()

        # Handle category-specific tables
        if category_enum == ModelServiceCategory.venue:
            hall_type_enum = HallType(hall_type) if hall_type else None
            indoor_outdoor_enum = IndoorOutdoor(indoor_outdoor) if indoor_outdoor else None
            decoration_policy_enum = DecorationPolicy(decoration_policy) if decoration_policy else None
            catering_policy_enum = CateringPolicy(catering_policy) if catering_policy else None
            alcohol_policy_enum = AlcoholPolicy(alcohol_policy) if alcohol_policy else None

            db.add(VenueService(
                service_id=db_service.id,
                capacity_min=capacity_min,
                capacity_max=capacity_max,
                hall_type=hall_type_enum,
                indoor_outdoor=indoor_outdoor_enum,
                square_feet=square_feet,
                parking_capacity=parking_capacity,
                decoration_policy=decoration_policy_enum,
                catering_policy=catering_policy_enum,
                alcohol_policy=alcohol_policy_enum
            ))

        elif category_enum == ModelServiceCategory.catering:
            cuisine_list = json.loads(cuisine_types) if cuisine_types else []
            service_style_enum = ServiceStyle(service_style) if service_style else None
            db.add(CateringService(
                service_id=db_service.id,
                cuisine_types=cuisine_list,
                veg_price_per_head=veg_price_per_head,
                nonveg_price_per_head=nonveg_price_per_head,
                min_order=min_order,
                max_order=max_order,
                service_style=service_style_enum,
                staff_included=True
            ))

        elif category_enum == ModelServiceCategory.dj:
            genres_list = json.loads(genres_supported) if genres_supported else []
            equipment_list = json.loads(equipment) if equipment else []
            db.add(DJService(
                service_id=db_service.id,
                genres_supported=genres_list,
                duration_hours=duration_hours,
                equipment=equipment_list
            ))

        elif category_enum == ModelServiceCategory.photographer:
            package_list = json.loads(package_type) if package_type else []
            db.add(PhotographerService(
                service_id=db_service.id,
                package_type=package_list,
                hours_covered=hours_covered,
                photos_delivered=photos_delivered,
                edited_photos_count=edited_photos_count,
                delivery_time_days=delivery_time_days,
                videography_included=bool(videography_included),
                drone_available=bool(drone_available),
                album_included=bool(album_included)
            ))

        elif category_enum == ModelServiceCategory.event_management:
            event_types_list = json.loads(event_types) if event_types else []
            includes_list = json.loads(includes) if includes else []
            package_modal_enum = PackageModal(package_modal) if package_modal else None
            db.add(EventManagementService(
                service_id=db_service.id,
                event_types=event_types_list,
                team_size=team_size,
                includes=includes_list,
                package_modal=package_modal_enum,
                vendor_network_size=vendor_network_size,
                experience_years=experience_years
            ))

        # Upload images to Supabase
        image_urls = []
        for img in images or []:
            file_bytes = await img.read()
            file_ext = img.filename.split(".")[-1] if "." in img.filename else "bin"
            file_path = f"services/{uuid4().hex}.{file_ext}"

            content_type, _ = mimetypes.guess_type(img.filename)
            if not content_type:
                content_type = "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            public_url = supabase.storage.from_("service-images").get_public_url(file_path)
            public_url_val = (
                public_url.get("publicURL")
                if isinstance(public_url, dict)
                else str(public_url)
            )
            image_urls.append(public_url_val)

        # Save image URLs in the JSONB field
        db_service.images = image_urls
        db.commit()
        db.refresh(db_service)

        return ServiceCreateResponse(
            message="Service created successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Failed to create service")
        raise HTTPException(status_code=500, detail=f"Failed to create service: {str(e)}")


@servicerouter.get(
    "/get-all",
    response_model=List[ServiceResponse],
    status_code=status.HTTP_200_OK,
    description="Retrieve all services for the authenticated vendor"
)
async def get_all_services(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["vendor"]))
):
    try:
        result = db.execute(
            select(Vendor.id).where(Vendor.user_id == current_user.id)
        )
        vendor_id = result.scalar()

        if not vendor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vendor identification failed"
            )

        services = db.query(Service).filter(Service.vendor_id == vendor_id).all()
        return [
            ServiceResponse(
                id=service.id,
                vendor_id=service.vendor_id,
                category=service.category.value,
                title=service.title,
                description=service.description,
                tags=service.tags or [],
                base_price=float(service.base_price),
                currency=service.currency,
                pricing_type=service.pricing_type.value,
                images=service.images or [],
                amenities=service.amenities or [],
                featured=service.featured,
                verified=service.verified,
                is_active=service.is_active,
                address_line1=service.address_line1,
                address_line2=service.address_line2,
                area=service.area,
                city=service.city,
                state=service.state,
                country=service.country,
                pincode=service.pincode,
                geo_point=service.geo_point,
                created_at=service.created_at,
                updated_at=service.updated_at
            ) for service in services
        ]

    except Exception as e:
        logger.exception("Failed to retrieve services")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve services: {str(e)}")

@servicerouter.put(
    "/{slug}",
    response_model=ServiceResponse,
    status_code=status.HTTP_200_OK,
    description="Update an existing service by slug"
)
async def update_service(
    slug: str,
    category: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    base_price: float = Form(...),
    pricing_type: str = Form(...),
    amenities: Optional[str] = Form(None),
    address_line1: Optional[str] = Form(None),
    address_line2: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    pincode: str = Form(...),
    geo_point: Optional[str] = Form(None),
    existing_images: Optional[str] = Form(None),
    capacity_min: Optional[int] = Form(None),
    capacity_max: Optional[int] = Form(None),
    hall_type: Optional[str] = Form(None),
    indoor_outdoor: Optional[str] = Form(None),
    square_feet: Optional[float] = Form(None),
    parking_capacity: Optional[int] = Form(None),
    decoration_policy: Optional[str] = Form(None),
    catering_policy: Optional[str] = Form(None),
    alcohol_policy: Optional[str] = Form(None),
    cuisine_types: Optional[str] = Form(None),
    veg_price_per_head: Optional[float] = Form(None),
    nonveg_price_per_head: Optional[float] = Form(None),
    min_order: Optional[int] = Form(None),
    max_order: Optional[int] = Form(None),
    service_style: Optional[str] = Form(None),
    staff_included: Optional[bool] = Form(None),
    crockery_cutlery_included: Optional[bool] = Form(None),
    tasting_available: Optional[bool] = Form(None),
    genres_supported: Optional[str] = Form(None),
    duration_hours: Optional[float] = Form(None),
    equipment: Optional[str] = Form(None),
    lighting_included: Optional[bool] = Form(None),
    mc_host_available: Optional[bool] = Form(None),
    setup_time_required: Optional[float] = Form(None),
    package_type: Optional[str] = Form(None),
    hours_covered: Optional[float] = Form(None),
    photos_delivered: Optional[int] = Form(None),
    edited_photos_count: Optional[int] = Form(None),
    delivery_time_days: Optional[int] = Form(None),
    videography_included: Optional[bool] = Form(None),
    drone_available: Optional[bool] = Form(None),
    album_included: Optional[bool] = Form(None),
    event_types: Optional[str] = Form(None),
    team_size: Optional[int] = Form(None),
    includes: Optional[str] = Form(None),
    package_modal: Optional[str] = Form(None),
    vendor_network_size: Optional[int] = Form(None),
    experience_years: Optional[int] = Form(None),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["vendor"]))
):
    try:
        result = db.execute(
            select(Vendor.id).where(Vendor.user_id == current_user.id)
        )
        vendor_id = result.scalar()

        if not vendor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vendor identification failed"
            )

        db_service = db.query(Service).filter(
            Service.slug == slug,
            Service.vendor_id == vendor_id
        ).first()

        if not db_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found or you do not have permission to update it"
            )

        # Parse JSON fields
        try:
            tags_list = json.loads(tags) if tags else []
            amenities_list = json.loads(amenities) if amenities else []
            geo_point_dict = json.loads(geo_point) if geo_point else None
            existing_images_list = json.loads(existing_images) if existing_images else []
            if geo_point_dict:
                geo_point_dict = GeoPoint(**geo_point_dict).dict()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON field: {str(e)}")

        # Validate Enums
        try:
            category_enum = ModelServiceCategory(category)
            pricing_type_enum = ModelPricingType(pricing_type)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Update base Service
        db_service.title = title
        db_service.slug = f"{title.lower().replace(' ', '-')}-{uuid4().hex[:8]}" if title != db_service.title else db_service.slug
        db_service.description = description
        db_service.tags = tags_list
        db_service.base_price = base_price
        db_service.pricing_type = pricing_type_enum
        db_service.amenities = amenities_list
        db_service.address_line1 = address_line1
        db_service.address_line2 = address_line2
        db_service.area = area
        db_service.city = city
        db_service.state = state
        db_service.country = country
        db_service.pincode = pincode
        db_service.geo_point = geo_point_dict
        db_service.updated_at = datetime.utcnow()

        # Update images
        image_urls = existing_images_list
        for img in images or []:
            file_bytes = await img.read()
            file_ext = img.filename.split(".")[-1] if "." in img.filename else "bin"
            file_path = f"services/{uuid4().hex}.{file_ext}"

            content_type, _ = mimetypes.guess_type(img.filename)
            if not content_type:
                content_type = "application/octet-stream"

            supabase.storage.from_("service-images").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            public_url = supabase.storage.from_("service-images").get_public_url(file_path)
            public_url_val = (
                public_url.get("publicURL")
                if isinstance(public_url, dict)
                else str(public_url)
            )
            image_urls.append(public_url_val)

        db_service.images = image_urls

        # Delete existing category-specific record if category changed
        if db_service.category != category_enum:
            if db_service.category == ModelServiceCategory.venue:
                db.execute(delete(VenueService).where(VenueService.service_id == db_service.id))
            elif db_service.category == ModelServiceCategory.catering:
                db.execute(delete(CateringService).where(CateringService.service_id == db_service.id))
            elif db_service.category == ModelServiceCategory.dj:
                db.execute(delete(DJService).where(DJService.service_id == db_service.id))
            elif db_service.category == ModelServiceCategory.photographer:
                db.execute(delete(PhotographerService).where(PhotographerService.service_id == db_service.id))
            elif db_service.category == ModelServiceCategory.event_management:
                db.execute(delete(EventManagementService).where(EventManagementService.service_id == db_service.id))

        db_service.category = category_enum

        # Update category-specific tables
        if category_enum == ModelServiceCategory.venue:
            hall_type_enum = HallType(hall_type) if hall_type else None
            indoor_outdoor_enum = IndoorOutdoor(indoor_outdoor) if indoor_outdoor else None
            decoration_policy_enum = DecorationPolicy(decoration_policy) if decoration_policy else None
            catering_policy_enum = CateringPolicy(catering_policy) if catering_policy else None
            alcohol_policy_enum = AlcoholPolicy(alcohol_policy) if alcohol_policy else None

            existing_venue = db.query(VenueService).filter(VenueService.service_id == db_service.id).first()
            if existing_venue:
                existing_venue.capacity_min = capacity_min
                existing_venue.capacity_max = capacity_max
                existing_venue.hall_type = hall_type_enum
                existing_venue.indoor_outdoor = indoor_outdoor_enum
                existing_venue.square_feet = square_feet
                existing_venue.parking_capacity = parking_capacity
                existing_venue.decoration_policy = decoration_policy_enum
                existing_venue.catering_policy = catering_policy_enum
                existing_venue.alcohol_policy = alcohol_policy_enum
            else:
                db.add(VenueService(
                    service_id=db_service.id,
                    capacity_min=capacity_min,
                    capacity_max=capacity_max,
                    hall_type=hall_type_enum,
                    indoor_outdoor=indoor_outdoor_enum,
                    square_feet=square_feet,
                    parking_capacity=parking_capacity,
                    decoration_policy=decoration_policy_enum,
                    catering_policy=catering_policy_enum,
                    alcohol_policy=alcohol_policy_enum
                ))

        elif category_enum == ModelServiceCategory.catering:
            cuisine_list = json.loads(cuisine_types) if cuisine_types else []
            service_style_enum = ServiceStyle(service_style) if service_style else None
            existing_catering = db.query(CateringService).filter(CateringService.service_id == db_service.id).first()
            if existing_catering:
                existing_catering.cuisine_types = cuisine_list
                existing_catering.veg_price_per_head = veg_price_per_head
                existing_catering.nonveg_price_per_head = nonveg_price_per_head
                existing_catering.min_order = min_order
                existing_catering.max_order = max_order
                existing_catering.service_style = service_style_enum
                existing_catering.staff_included = bool(staff_included) if staff_included is not None else False
                existing_catering.crockery_cutlery_included = bool(crockery_cutlery_included) if crockery_cutlery_included is not None else False
                existing_catering.tasting_available = bool(tasting_available) if tasting_available is not None else False
            else:
                db.add(CateringService(
                    service_id=db_service.id,
                    cuisine_types=cuisine_list,
                    veg_price_per_head=veg_price_per_head,
                    nonveg_price_per_head=nonveg_price_per_head,
                    min_order=min_order,
                    max_order=max_order,
                    service_style=service_style_enum,
                    staff_included=bool(staff_included) if staff_included is not None else False,
                    crockery_cutlery_included=bool(crockery_cutlery_included) if crockery_cutlery_included is not None else False,
                    tasting_available=bool(tasting_available) if tasting_available is not None else False
                ))

        elif category_enum == ModelServiceCategory.dj:
            genres_list = json.loads(genres_supported) if genres_supported else []
            equipment_list = json.loads(equipment) if equipment else []
            existing_dj = db.query(DJService).filter(DJService.service_id == db_service.id).first()
            if existing_dj:
                existing_dj.genres_supported = genres_list
                existing_dj.duration_hours = duration_hours
                existing_dj.equipment = equipment_list
                existing_dj.lighting_included = bool(lighting_included) if lighting_included is not None else False
                existing_dj.mc_host_available = bool(mc_host_available) if mc_host_available is not None else False
                existing_dj.setup_time_required = setup_time_required
            else:
                db.add(DJService(
                    service_id=db_service.id,
                    genres_supported=genres_list,
                    duration_hours=duration_hours,
                    equipment=equipment_list,
                    lighting_included=bool(lighting_included) if lighting_included is not None else False,
                    mc_host_available=bool(mc_host_available) if mc_host_available is not None else False,
                    setup_time_required=setup_time_required
                ))

        elif category_enum == ModelServiceCategory.photographer:
            package_list = json.loads(package_type) if package_type else []
            existing_photographer = db.query(PhotographerService).filter(PhotographerService.service_id == db_service.id).first()
            if existing_photographer:
                existing_photographer.package_type = package_list
                existing_photographer.hours_covered = hours_covered
                existing_photographer.photos_delivered = photos_delivered
                existing_photographer.edited_photos_count = edited_photos_count
                existing_photographer.delivery_time_days = delivery_time_days
                existing_photographer.videography_included = bool(videography_included) if videography_included is not None else False
                existing_photographer.drone_available = bool(drone_available) if drone_available is not None else False
                existing_photographer.album_included = bool(album_included) if album_included is not None else False
            else:
                db.add(PhotographerService(
                    service_id=db_service.id,
                    package_type=package_list,
                    hours_covered=hours_covered,
                    photos_delivered=photos_delivered,
                    edited_photos_count=edited_photos_count,
                    delivery_time_days=delivery_time_days,
                    videography_included=bool(videography_included) if videography_included is not None else False,
                    drone_available=bool(drone_available) if drone_available is not None else False,
                    album_included=bool(album_included) if album_included is not None else False
                ))

        elif category_enum == ModelServiceCategory.event_management:
            event_types_list = json.loads(event_types) if event_types else []
            includes_list = json.loads(includes) if includes else []
            package_modal_enum = PackageModal(package_modal) if package_modal else None
            existing_event_management = db.query(EventManagementService).filter(EventManagementService.service_id == db_service.id).first()
            if existing_event_management:
                existing_event_management.event_types = event_types_list
                existing_event_management.team_size = team_size
                existing_event_management.includes = includes_list
                existing_event_management.package_modal = package_modal_enum
                existing_event_management.vendor_network_size = vendor_network_size
                existing_event_management.experience_years = experience_years
            else:
                db.add(EventManagementService(
                    service_id=db_service.id,
                    event_types=event_types_list,
                    team_size=team_size,
                    includes=includes_list,
                    package_modal=package_modal_enum,
                    vendor_network_size=vendor_network_size,
                    experience_years=experience_years
                ))

        db.commit()
        db.refresh(db_service)

        return ServiceResponse(
            id=db_service.id,
            vendor_id=db_service.vendor_id,
            category=db_service.category.value,
            title=db_service.title,
            slug=db_service.slug,
            description=db_service.description,
            tags=db_service.tags or [],
            base_price=float(db_service.base_price),
            currency=db_service.currency,
            pricing_type=db_service.pricing_type.value,
            images=db_service.images or [],
            amenities=db_service.amenities or [],
            featured=db_service.featured,
            verified=db_service.verified,
            is_active=db_service.is_active,
            address_line1=db_service.address_line1,
            address_line2=db_service.address_line2,
            area=db_service.area,
            city=db_service.city,
            state=db_service.state,
            country=db_service.country,
            pincode=db_service.pincode,
            geo_point=db_service.geo_point,
            created_at=db_service.created_at,
            updated_at=db_service.updated_at,
            message="Service updated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Failed to update service")
        raise HTTPException(status_code=500, detail=f"Failed to update service: {str(e)}")

@servicerouter.delete(
    "/{slug}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete a service and its associated data by slug"
)
async def delete_service(
    slug: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["vendor"]))
):
    try:
        result = db.execute(
            select(Vendor.id).where(Vendor.user_id == current_user.id)
        )
        vendor_id = result.scalar()

        if not vendor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vendor identification failed"
            )

        db_service = db.query(Service).filter(
            Service.slug == slug,
            Service.vendor_id == vendor_id
        ).first()

        if not db_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found or you do not have permission to delete it"
            )

        # Delete associated images from Supabase
        for image_url in db_service.images or []:
            file_path = image_url.split("/")[-1]
            supabase.storage.from_("service-images").remove([f"services/{file_path}"])

        # Delete category-specific record
        if db_service.category == ModelServiceCategory.venue:
            db.execute(delete(VenueService).where(VenueService.service_id == db_service.id))
        elif db_service.category == ModelServiceCategory.catering:
            db.execute(delete(CateringService).where(CateringService.service_id == db_service.id))
        elif db_service.category == ModelServiceCategory.dj:
            db.execute(delete(DJService).where(DJService.service_id == db_service.id))
        elif db_service.category == ModelServiceCategory.photographer:
            db.execute(delete(PhotographerService).where(PhotographerService.service_id == db_service.id))
        elif db_service.category == ModelServiceCategory.event_management:
            db.execute(delete(EventManagementService).where(EventManagementService.service_id == db_service.id))

        # Delete the service
        db.execute(delete(Service).where(Service.slug == slug))
        db.commit()

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Failed to delete service")
        raise HTTPException(status_code=500, detail=f"Failed to delete service: {str(e)}")
