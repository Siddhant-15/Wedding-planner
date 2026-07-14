# import logging
# from typing import List, Optional
# from fastapi import APIRouter, Depends, HTTPException, status, Query
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import desc, asc, nulls_last, select, func
# from sqlalchemy.orm import selectinload, joinedload
# from app.Db.db import get_db
# from app.Dependencies.Auth import get_current_user
# from app.models.models import Service, Vendor
# from app.schemas.customer_services import (
#     ServiceDetailResponse, ServiceCardSchema, VenueDetailSchema,
#     ServiceVariantDetailSchema, VendorCardSchema, UnavailableDateSchema,
#     CateringDetailSchema, DjDetailSchema, PhotographyDetailSchema, EventManagementDetailSchema, MakeupArtistDetailSchema
# )

# customerservicerouter = APIRouter()
# logger = logging.getLogger(__name__)

# @customerservicerouter.get("/{service_type}/list")
# async def get_service_cards(
#     service_type: str,
#     skip: int = Query(0, ge=0),
#     limit: int = Query(12, ge=1, le=50),
#     city: Optional[str] = Query(None),
#     db: AsyncSession = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     query = (
#         select(Service)
#         .options(
#             joinedload(Service.vendor),
#             joinedload(Service.venue),
#             joinedload(Service.variants),
#             joinedload(Service.media),
#             # No need to load all type-specific details in list view for performance
#         )
#         .filter(
#             Service.service_type == service_type,
#             Service.is_active == True,
#         )
#     )

#     count_query = select(func.count(Service.id)).filter(
#         Service.service_type == service_type,
#         Service.is_active == True,
#     )

#     if city:
#         query = query.filter(Service.city.ilike(f"%{city}%"))
#         count_query = count_query.filter(Service.city.ilike(f"%{city}%"))

#     query = query.order_by(desc(Service.created_at))

#     count_result = await db.execute(count_query)
#     total = count_result.scalar_one()

#     result = await db.execute(query.offset(skip).limit(limit))
#     services = result.scalars().unique().all()

#     results = []
#     for service in services:
#         images = [
#             media.media_url
#             for media in sorted(service.media, key=lambda x: x.display_order)
#         ]

#         venue_data = VenueDetailSchema.model_validate(service.venue) if service.venue else None
#         variants_data = [ServiceVariantDetailSchema.model_validate(v) for v in service.variants]

#         card_data = ServiceCardSchema(
#             id=str(service.id),
#             name=service.service_name,
#             description=service.description,
#             images=images,
#             area=service.area or "",
#             city=service.city,
#             state=service.state,
#             add_line1=service.add_line1,
#             add_line2=service.add_line2,
#             country=service.country,
#             latitude=float(service.latitude) if service.latitude else None,
#             longitude=float(service.longitude) if service.longitude else None,
#             vendor_name=service.vendor.business_name or "Unknown",
#             vendor_id=str(service.vendor.id),
#             service_type=service.service_type,
#             venue=venue_data,
#             variants=variants_data
#         )
#         results.append(card_data)

#     return {
#         "services": results,
#         "total_count": total,
#         "user_role": current_user.get("role") if current_user else None
#     }


# @customerservicerouter.get(
#     "/services/detail/{service_id}",
#     response_model=ServiceDetailResponse,
#     status_code=status.HTTP_200_OK
# )
# async def get_service_detail(
#     service_id: int,
#     db: AsyncSession = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ) -> ServiceDetailResponse:
    
#     result = await db.execute(
#         select(Service)
#         .options(
#             joinedload(Service.vendor),
#             joinedload(Service.venue),
#             joinedload(Service.catering),
#             joinedload(Service.dj),
#             joinedload(Service.photography),
#             joinedload(Service.event_management),
#             joinedload(Service.makeup_artist),
#             selectinload(Service.variants),
#             selectinload(Service.media),
#             selectinload(Service.unavailable_dates),
#         )
#         .filter(
#             Service.id == service_id,
#             Service.is_active == True,
#         )
#     )
#     service = result.unique().scalar_one_or_none()

#     if not service:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Service not found or unavailable"
#         )

#     # Sort images: cover first, then by display_order
#     images = [
#         m.media_url
#         for m in sorted(
#             service.media,
#             key=lambda x: (not x.is_cover, x.display_order)
#         )
#     ]

#     venue_data = VenueDetailSchema.model_validate(service.venue) if service.venue else None
#     variants_data = [ServiceVariantDetailSchema.model_validate(v) for v in service.variants]

#     unavailable_dates_data = [
#         UnavailableDateSchema.model_validate(d) for d in service.unavailable_dates
#     ]

#     # Service type specific data
#     catering_data = CateringDetailSchema.model_validate(service.catering) if service.catering else None
#     dj_data = DjDetailSchema.model_validate(service.dj) if service.dj else None
#     photography_data = PhotographyDetailSchema.model_validate(service.photography) if service.photography else None
#     event_data = EventManagementDetailSchema.model_validate(service.event_management) if service.event_management else None
#     makeup_data = MakeupArtistDetailSchema.model_validate(service.makeup_artist) if service.makeup_artist else None

#     vendor_data = VendorCardSchema.model_validate(service.vendor)

#     return ServiceDetailResponse(
#         id=str(service.id),
#         name=service.service_name,
#         description=service.description,
#         long_description=service.description,           # You can add a separate long_description column later
#         images=images,
#         area=service.area or "",
#         city=service.city,
#         state=service.state,
#         add_line1=service.add_line1,
#         add_line2=service.add_line2,
#         country=service.country,
#         latitude=float(service.latitude) if service.latitude else None,
#         longitude=float(service.longitude) if service.longitude else None,
#         vendor_name=service.vendor.business_name or "Unknown",
#         vendor_id=str(service.vendor.id),
#         service_type=service.service_type,
#         venue=venue_data,
#         variants=variants_data,
#         pincode=service.pincode,
#         metadata=service.metadata_,
#         featured=False,                                 # Add featured column later if needed
#         created_at=service.created_at,
#         updated_at=service.updated_at,
#         vendor=vendor_data,
#         catering=catering_data,
#         dj=dj_data,
#         photography=photography_data,
#         event_management=event_data,
#         makeup_artist=makeup_data,
#         unavailable_dates=unavailable_dates_data,
#         user_role=current_user.get("role") if current_user else None,
#     )