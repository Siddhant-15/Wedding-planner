import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, asc, nulls_last, select, func
from sqlalchemy.orm import selectinload, joinedload
from app.Db.db import get_db
from app.Dependencies.Auth import get_current_user
from app.models.models import Service, Vendor
from app.schemas.customer_services import (
    ServiceDetailResponse, ServiceCardSchema, VenueDetailSchema,
    ServiceVariantDetailSchema, VendorCardSchema, UnavailableDateSchema
)

customerservicerouter = APIRouter()
logger = logging.getLogger(__name__)

@customerservicerouter.get("/{service_type}/list")
async def get_service_cards(
    service_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
    city: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = (
        select(Service)
        .options(
            joinedload(Service.vendor),
            joinedload(Service.venue),
            joinedload(Service.variants),
            joinedload(Service.media),
            joinedload(Service.unavailable_dates)
        )
        .filter(
            Service.service_type == service_type,
            Service.is_active == True,
        )
    )

    count_query = select(func.count(Service.id)).filter(
        Service.service_type == service_type,
        Service.is_active == True,
    )

    if city:
        query = query.filter(Service.city.ilike(f"%{city}%"))
        count_query = count_query.filter(Service.city.ilike(f"%{city}%"))

    query = query.order_by(desc(Service.created_at))
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    result = await db.execute(query.offset(skip).limit(limit))
    services = result.scalars().unique().all()

    results = []
    for service in services:
        images = [
    media.media_url
    for media in sorted(service.media, key=lambda x: x.display_order)
]
        
        venue_data = None
        if service.venue:
            venue_data = VenueDetailSchema.from_orm(service.venue)
            
        variants_data = [ServiceVariantDetailSchema.from_orm(v) for v in service.variants]

        card_data = ServiceCardSchema(
            id=str(service.id),
            name=service.service_name,
            description=service.description,
            images=images,
            area=service.area or "",
            city=service.city,
            state=service.state,
            add_line1=service.add_line1,
            add_line2=service.add_line2,
            country=service.country,
            latitude=service.latitude,
            longitude=service.longitude,
            vendor_name=service.vendor.business_name if service.vendor.business_name else "Unknown",
            vendor_id=str(service.vendor.id),
            service_type=service.service_type,
            venue=venue_data,
            variants=variants_data
        )
        results.append(card_data)

    return {
        "services": results,
        "total_count": total,
        "user_role": current_user.get("role") if current_user else None
    }


@customerservicerouter.get(
    "/services/detail/{service_id}",
    response_model=ServiceDetailResponse,
    status_code=status.HTTP_200_OK
)
async def get_service_detail(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> ServiceDetailResponse:
    result = await db.execute(
        select(Service)
        .options(
            joinedload(Service.vendor),       
            joinedload(Service.venue),        
            selectinload(Service.variants),    
            selectinload(Service.media),       
            selectinload(Service.unavailable_dates)
        )
        .filter(
            Service.id == service_id,
            Service.is_active == True,
        )
    )
    service = result.unique().scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found or unavailable"
        )

    images = [
    m.media_url
    for m in sorted(service.media, key=lambda x: (not x.is_cover, x.display_order))
]
    
    venue_data = None
    if service.venue:
        venue_data = VenueDetailSchema.from_orm(service.venue)
        
    variants_data = [ServiceVariantDetailSchema.from_orm(v) for v in service.variants]

    unavailable_dates_data = [UnavailableDateSchema.from_orm(d) for d in service.unavailable_dates] if service.unavailable_dates else []

    vendor_data = VendorCardSchema(
        id=str(service.vendor.id),
        name=service.vendor.business_name,
        description=service.vendor.business_description,
        phone=service.vendor.phone,
        email=service.vendor.email,
        experience=service.vendor.experience_years,
        city=service.vendor.city,
        state=service.vendor.state,
        add_line1=service.vendor.add_line1,
        add_line2=service.vendor.add_line2,
        country=service.vendor.country,
        pincode=service.vendor.pincode,
        contact_person=service.vendor.contact_person,
        website=service.vendor.website,
        avatar=service.vendor.avatar
    )

    return ServiceDetailResponse(
        id=str(service.id),
        name=service.service_name,
        description=service.description,
        long_description=service.description,
        images=images,
        area=service.area or "",
        city=service.city,
        state=service.state,
        add_line1=service.add_line1,
        add_line2=service.add_line2,
        country=service.country,
        latitude=service.latitude,
        longitude=service.longitude,
        vendor_name=service.vendor.business_name,
        vendor_id=str(service.vendor.id),
        service_type=service.service_type,
        venue=venue_data,
        variants=variants_data,
        pincode=service.pincode,
        metadata=service.metadata_,
        featured=False,
        created_at=service.created_at,
        updated_at=service.updated_at,
        vendor=vendor_data,
        user_role=current_user.get("role") if current_user else None,
        unavailable_dates=unavailable_dates_data
    )