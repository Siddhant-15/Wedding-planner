# app/routers/services/detail.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import Optional
import logging

from app.schemas.customer_services import ServiceDetailResponse, ServiceCardSchema, VenueCardSchema, CateringCardSchema, DJDetailSchema, PhotographerDetailSchema, EventManagementDetailSchema
# app/routers/customer_services.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, nulls_last, nulls_first
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Service, Vendor, ServiceRatingSummary

customerservicerouter = APIRouter()
logger = logging.getLogger(__name__)


@customerservicerouter.get("/{service_type}/list")
def get_service_cards(
    service_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
    sort_by: str = Query("popularity", regex="^(popularity|price-low|price-high|rating|newest)$"),
    city: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    from app.models.models import ServiceCategory, ServiceRatingSummary

    try:
        category_enum = ServiceCategory(service_type.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid service type: {service_type}")

    # Base query with ALWAYS joined rating summary (as LEFT JOIN)
    query = (
        db.query(Service)
        .outerjoin(ServiceRatingSummary, Service.id == ServiceRatingSummary.service_id)
        .options(
            joinedload(Service.vendor),
            joinedload(Service.venue_service),
            joinedload(Service.catering_service),
            joinedload(Service.dj_service),
            joinedload(Service.photographer_service),
            joinedload(Service.event_management_service),
        )
        .filter(
            Service.category == category_enum,
            Service.is_active == True,
        )
    )

    # Filters
    if city:
        query = query.filter(Service.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Service.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Service.base_price <= max_price)

    # Sorting — now safe because ServiceRatingSummary is always joined
    sort_map = {
        "price-low": asc(Service.base_price),
        "price-high": desc(Service.base_price),
        "rating": desc(ServiceRatingSummary.average_rating).nulls_last(),
        "newest": desc(Service.created_at),
        "popularity": desc(ServiceRatingSummary.total_reviews).nulls_last(),
    }

    default_sort = sort_map["popularity"]
    order_clause = sort_map.get(sort_by, default_sort)

    query = query.order_by(order_clause, desc(Service.featured))

    # Now safe to count
    total = query.count()
    services = query.offset(skip).limit(limit).all()

    # Rest of serialization...
    results = []
    for service in services:
        rating_summary = service.rating_summary

        card_data = ServiceCardSchema(
            id=str(service.id),
            name=service.title,
            description=service.description,
            images=service.images or [],
            price=float(service.base_price) if service.base_price else None,
            currency=service.currency,
            rating=float(rating_summary.average_rating) if rating_summary and rating_summary.average_rating else None,
            total_reviews=rating_summary.total_reviews if rating_summary else 0,
            area=service.area or "",
            city=service.city,
            state=service.state,
            address_line1=service.address_line1,
            address_line2=service.address_line2,
            vendor_name=service.vendor.business_name or "Unknown Vendor",
            vendor_id=str(service.vendor.id),
            service_type=service.category.value,
            venue=VenueCardSchema.from_orm(service.venue_service) if service.venue_service else None,
            catering=CateringCardSchema.from_orm(service.catering_service) if service.catering_service else None,
            dj=DJDetailSchema.from_orm(service.dj_service) if service.dj_service else None,
            photographer=PhotographerDetailSchema.from_orm(service.photographer_service) if service.photographer_service else None,
            event_management=EventManagementDetailSchema.from_orm(service.event_management_service) if service.event_management_service else None,
        )
        results.append(card_data)

    return {
        "services": results,
        "total_count": total
    }



@customerservicerouter.get(
    "/services/detail/{service_id}",
    response_model=ServiceDetailResponse,
    summary="Get complete service details",
    description="Fetch full service profile with vendor,ratings, and category-specific data.",
    status_code=status.HTTP_200_OK
)
async def get_service_detail(
    service_id: str,
    db: Session = Depends(get_db)
) -> ServiceDetailResponse:
    """
    Retrieve detailed service information by UUID.

    - **service_id**: UUID of the service
    - Includes: vendor, ratings, images, location, amenities, category specs
    - Returns 404 if not found or inactive
    """
    try:
        service = (
            db.query(Service)
            .options(
                joinedload(Service.vendor),
                joinedload(Service.rating_summary),
                joinedload(Service.venue_service),
                joinedload(Service.catering_service),
                joinedload(Service.dj_service),
                joinedload(Service.photographer_service),
                joinedload(Service.event_management_service),
            )
            .filter(
                and_(
                    Service.id == service_id,
                    Service.is_active == True,
                    # Service.verified == True
                )
            )
            .first()
        )

        if not service:
            logger.warning(f"Service not found or inactive: {service_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found or unavailable"
            )

        # Build response manually to control nulls and types
        rating_summary = service.rating_summary
        response_data = {
            "id": str(service.id),
            "name": service.title,
            "description": service.description,
            "long_description": service.description,  # or dedicated field
            "images": service.images or [],
            "price": float(service.base_price) if service.base_price else None,
            "currency": service.currency,
            "rating": float(rating_summary.average_rating) if rating_summary and rating_summary.average_rating else None,
            "review_count": rating_summary.total_reviews if rating_summary else 0,
            "city": service.city or "",
            "state": service.state or "",
            "address_line1": service.address_line1,
            "address_line2": service.address_line2,
            "pincode": service.pincode,
            "service_type": service.category.value,
            "amenities": service.amenities or [],
            "tags": service.tags or [],
            "featured": bool(service.featured),
            "created_at": service.created_at,
            "updated_at": service.updated_at,
            "vendor": {
                "id": str(service.vendor.id),
                "name": service.vendor.business_name,
                "description": service.vendor.business_description,
                "phone": service.vendor.phone,
                "email": service.vendor.user.email if service.vendor.user else None,
                "experience": service.vendor.experience_years,
                "city": service.vendor.city,
                "state": service.vendor.state,
            }
        }

        # Attach category-specific data
        if service.venue_service:
            response_data["venue"] = {
                "capacity_max": service.venue_service.capacity_max,
                "capacity_min": service.venue_service.capacity_min,
                "hall_type": service.venue_service.hall_type.value,
                "indoor_outdoor": service.venue_service.indoor_outdoor.value,
                "square_feet": float(service.venue_service.square_feet) if service.venue_service.square_feet else None,
                "parking_capacity": service.venue_service.parking_capacity,
                "decoration_policy": service.venue_service.decoration_policy.value,
                "catering_policy": service.venue_service.catering_policy.value,
                "alcohol_policy": service.venue_service.alcohol_policy.value,
            }
        elif service.catering_service:
            response_data["catering"] = {
                "cuisine_types": service.catering_service.cuisine_types or [],
                "veg_price_per_head": float(service.catering_service.veg_price_per_head) if service.catering_service.veg_price_per_head else None,
                "nonveg_price_per_head": float(service.catering_service.nonveg_price_per_head) if service.catering_service.nonveg_price_per_head else None,
                "min_order": service.catering_service.min_order,
                "max_order": service.catering_service.max_order,
                "service_style": service.catering_service.service_style.value,
            }

        return ServiceDetailResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching service {service_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )