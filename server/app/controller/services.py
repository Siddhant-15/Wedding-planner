# from typing import List, Optional
# from fastapi import UploadFile, HTTPException
# from sqlalchemy.orm import Session

# from app.models.models import Service, Venue, ServiceVariant
# from app.schemas.services import ServiceCreate, ServiceType
# from app.utils.storage import upload_service_images


# async def create_service(
#     db: Session,
#     vendor_id: int,
#     data: ServiceCreate,
#     images: List[UploadFile] = None,
# ) -> Service:
#     if data.service_type not in ServiceType.__args__:
#         raise HTTPException(422, detail=f"Invalid service_type. Allowed: {', '.join(ServiceType.__args__)}")

#     # ─── Create base service ───────────────────────────────────────
#     service = Service(
#         vendor_id=vendor_id,
#         service_type=data.service_type,
#         service_name=data.service_name.strip(),
#         description=data.description,
#         add_line1=data.add_line1,
#         add_line2=data.add_line2,
#         area=data.area,
#         city=data.city,
#         state=data.state,
#         country=data.country,
#         pincode=data.pincode,
#         latitude=data.latitude,
#         longitude=data.longitude,
#         metadata_=data.metadata or {},
#     )

#     db.add(service)
#     db.flush()  # get service.id

#     # ─── Venue specific ─────────────────────────────────────────────
#     if data.service_type == "venue" and data.venue:
#         venue = Venue(
#             service_id=service.id,
#             venue_type=data.venue.venue_type,
#             venue_nature=data.venue.venue_nature,
#             max_capacity=data.venue.max_capacity,
#             parking_capacity=data.venue.parking_capacity,
#             catering_options=data.venue.catering_options,
#             venue_rules=data.venue.venue_rules or {},
#         )
#         db.add(venue)

#     # ─── Variants ───────────────────────────────────────────────────
#     for v in data.variants:
#         variant = ServiceVariant(
#             service_id=service.id,
#             variant_name=v.variant_name.strip(),
#             description=v.description,
#             min_quantity=v.min_quantity,
#             max_quantity=v.max_quantity,
#             pricing=v.pricing,
#             inclusions=v.inclusions or [],
#             exclusions=v.exclusions or [],
#             menu=v.menu,
#             deliverables=v.deliverables,
#             policies=v.policies,
#             metadata_={},
#         )
#         db.add(variant)

#     # ─── Images (reusable upload) ──────────────────────────────────
#     if images and len(images) > 0:
#         try:
#             urls = await upload_service_images(images, service.id, vendor_id)
#             if urls:
#                 service.metadata_["images"] = service.metadata_.get("images", []) + urls
#         except Exception as e:
#             db.rollback()
#             raise HTTPException(500, detail=f"Image upload failed: {str(e)}")

#     try:
#         db.commit()
#         db.refresh(service)
#         return service
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(500, detail=f"Database error: {str(e)}")


# # Future reuse example: update function can use similar pattern
# # async def update_service(db: Session, service_id: int, vendor_id: int, data: ServiceUpdate, images: List[UploadFile]):
# #     ...