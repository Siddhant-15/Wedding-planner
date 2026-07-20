# app/controllers/service_controller.py
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.models.models import Service
from app.repositories.customer.service_repository import ServiceRepository
from app.schemas.customer_services import (
    ServiceCardSchema, ServiceDetailResponse, VenueDetailSchema,
    ServiceVariantDetailSchema, VendorCardSchema, UnavailableDateSchema,
    CateringDetailSchema, DjDetailSchema, PhotographyDetailSchema,
    EventManagementDetailSchema, MakeupArtistDetailSchema
)


class ServiceController:
    @staticmethod
    def _build_service_card(service: Service) -> ServiceCardSchema:
        version = service.current_live_version
        if not version:
            raise HTTPException(status_code=404, detail="Service version not found")

        # Images
        images = [
            m.media_url for m in sorted(
                version.media or [], 
                key=lambda x: (not x.is_cover, x.display_order)
            )
        ]

        venue_data = VenueDetailSchema.model_validate(version.venue_detail) if version.venue_detail else None
        variants_data = [
            ServiceVariantDetailSchema.model_validate(v) 
            for v in (version.variants or [])
        ]

        return ServiceCardSchema(
            id=str(service.id),
            name=version.service_name,
            description=version.description,
            images=images,
            area=version.area or "",
            city=version.city,
            state=version.state,
            add_line1=version.add_line1,
            add_line2=version.add_line2,
            country=version.country,
            latitude=float(version.latitude) if version.latitude else None,
            longitude=float(version.longitude) if version.longitude else None,
            vendor_name=service.vendor.business_name or "Unknown",
            vendor_id=str(service.vendor.id),
            service_type=service.service_type,
            venue=venue_data,
            variants=variants_data
        )

    @staticmethod
    async def get_service_cards(
        db, service_type: str, skip: int, limit: int, city: str = None
    ) -> Dict:
        services, total = await ServiceRepository.get_service_cards(
            db, service_type, skip, limit, city
        )


        results = [ServiceController._build_service_card(s) for s in services]

        return {
            "services": results,
            "total_count": total,
        }

    @staticmethod
    async def get_service_detail(
        db, service_id: int, current_user: dict
    ) -> ServiceDetailResponse:
        service = await ServiceRepository.get_service_detail(db, service_id)
        
        if not service or not service.current_live_version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found or unavailable"
            )

        version = service.current_live_version

        # Images

        images = [
            {
                'url': m.media_url,
                'type': m.media_type,
                'is_cover': bool(m.is_cover),
            }
            for m in sorted(
                version.media or [],
                key=lambda x: (not x.is_cover, x.display_order or 0)
            )
        ]

        venue_data = VenueDetailSchema.model_validate(version.venue_detail) if getattr(version, 'venue_detail', None) else None
        variants_data = [ServiceVariantDetailSchema.model_validate(v) for v in (getattr(version, 'variants', None) or [])]
        # unavailable_dates_data = [
        #     UnavailableDateSchema.model_validate(d) for d in (service.unavailable_dates or [])
        # ]

        # Type-specific details
        catering_data = CateringDetailSchema.model_validate(version.catering_detail) if getattr(version, 'catering_detail', None) else None
        dj_data = DjDetailSchema.model_validate(version.dj_detail) if getattr(version, 'dj_detail', None) else None
        photography_data = PhotographyDetailSchema.model_validate(version.photography_detail) if getattr(version, 'photography_detail', None) else None
        event_data = EventManagementDetailSchema.model_validate(version.event_management_detail) if getattr(version, 'event_management_detail', None) else None
        makeup_data = MakeupArtistDetailSchema.model_validate(version.makeup_artist_detail) if getattr(version, 'makeup_artist_detail', None) else None

        vendor_data = VendorCardSchema.model_validate(service.vendor)

        return ServiceDetailResponse(
            id=str(service.id),
            name=version.service_name,
            description=version.description,
            long_description=version.description,
            images=images,
            area=version.area or "",
            city=version.city,
            state=version.state,
            add_line1=version.add_line1,
            add_line2=version.add_line2,
            country=version.country,
            latitude=float(version.latitude) if version.latitude else None,
            longitude=float(version.longitude) if version.longitude else None,
            vendor_name=service.vendor.business_name or "Unknown",
            vendor_id=str(service.vendor.id),
            service_type=service.service_type.value if hasattr(service.service_type, 'value') else service.service_type,
            venue=venue_data,
            variants=variants_data,
            pincode=version.pincode,
            metadata=version.metadata_,   
            featured=False,
            created_at=service.created_at,
            updated_at=service.updated_at,
            vendor=vendor_data,
            catering=catering_data,
            dj=dj_data,
            photography=photography_data,
            event_management=event_data,
            makeup_artist=makeup_data,
            # unavailable_dates=unavailable_dates_data,
            unavailable_dates = [],
            user_role=current_user.get("role") if current_user else None,
        )