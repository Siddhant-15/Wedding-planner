# from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
# from sqlalchemy.orm import Session, joinedload
# from typing import List, Optional
# from uuid import UUID
# from decimal import Decimal
# import uuid, json, mimetypes
# from app.database import get_db
# from app.utils.supabase_client import supabase
# from app.models import Service, User, ServiceImage
# from app.core.security import require_role
# from app.schemas.services import ServiceUpdate, ServiceResponse, ServiceType

# router = APIRouter(prefix="/services", tags=["Services"])


# @router.post("/create", response_model=ServiceResponse)
# async def create_service(
#     name: str = Form(...),
#     type: str = Form(...),
#     description: str = Form(...),
#     price: Optional[float] = Form(None),
#     country: Optional[str] = Form(None),
#     state: Optional[str] = Form(None),
#     city: Optional[str] = Form(None),
#     venue: Optional[str] = Form(None),
#     capacity: Optional[str] = Form(None),
#     amenities: Optional[str] = Form(None),
#     # status: Optional[str] = Form("active"),
#     images: List[UploadFile] = File([]),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_role(["vendor"]))
# ):
#     # Parse amenities
#     amenities_list: List[str] = []
#     if amenities:
#         try:
#             parsed = json.loads(amenities)
#             if isinstance(parsed, list):
#                 amenities_list = [str(a) for a in parsed]
#             else:
#                 amenities_list = [str(parsed)]
#         except Exception:
#             amenities_list = [a.strip() for a in amenities.split(",") if a.strip()]

#     # Validate user
#     user_id = current_user.id
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=400, detail="User not found")

#     price = float(price) if price not in (None, "") else None

#     # Create service
#     db_service = Service(
#         user_id=current_user.id,
#         name=name,
#         type=ServiceType(type),
#         description=description,
#         price=price,
#         country=country,
#         state=state,
#         city=city,
#         venue=venue,
#         capacity=capacity,
#         amenities=amenities_list,
#         # status=status,
#     )
#     db.add(db_service)
#     db.commit()
#     db.refresh(db_service)

#     # Upload images to Supabase
#     for img in images:
#         file_bytes = await img.read()  # ✅ async file read
#         file_ext = img.filename.split(".")[-1]
#         file_path = f"services/{uuid.uuid4()}.{file_ext}"

#         # Detect MIME type
#         content_type, _ = mimetypes.guess_type(img.filename)
#         if not content_type:
#             content_type = "application/octet-stream"


#         try:
#             supabase.storage.from_("service-images").upload(
#                 path=file_path,
#                 file=file_bytes,
#                 file_options={"content-type": content_type}
#             )
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

#         public_url = supabase.storage.from_("service-images").get_public_url(file_path)
#         db_image = ServiceImage(service_id=db_service.id, image_url=public_url, path=file_path)
#         db.add(db_image)

#     db.commit()
#     db.refresh(db_service)

#     return db_service


# @router.get("/get-all", response_model=List[ServiceResponse])
# def get_services(
#     skip: int = 0,
#     limit: int = Query(100, le=100),
#     user_id: Optional[str] = Query(None, description="Filter by user ID"),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_role(["vendor"]))
# ):
#     query = db.query(Service).filter(Service.user_id == current_user.id)
#     services = query.offset(skip).limit(limit).all()

#     for s in services:
#         if not (isinstance(s.price, (int, float, Decimal)) and s.price == s.price):  # NaN check
#             s.price = 0  # or None

#     return services

# @router.get("/get-by-type")
# def get_services_by_type(
#     type: str = Query(..., description="Filter by service type (e.g., Wedding Venue, DJ)"),
#     skip: int = 0,
#     limit: int = Query(100, le=100),
#     city: Optional[str] = Query(None, description="Filter by city"),
#     state: Optional[str] = Query(None, description="Filter by state"),
#     min_price: Optional[float] = Query(None, description="Minimum price"),
#     max_price: Optional[float] = Query(None, description="Maximum price"),
#     db: Session = Depends(get_db)
# ):
#     try:
#         service_type = ServiceType(type)
#     except ValueError:
#         raise HTTPException(status_code=400, detail=f"Invalid service type: {type}")

#     # preload images with joinedload
#     query = db.query(Service).options(joinedload(Service.images)).filter(Service.type == service_type)

#     if city:
#         query = query.filter(Service.city == city)
#     if state:
#         query = query.filter(Service.state == state)
#     if min_price is not None:
#         query = query.filter(Service.price >= min_price)
#     if max_price is not None:
#         query = query.filter(Service.price <= max_price)

#     total_count = query.count()
#     services = query.offset(skip).limit(limit).all()

#     # build response with images
#     response_data = []
#     for s in services:
#         response_data.append({
#             "id": str(s.id),
#             "name": s.name,
#             "description": s.description,
#             "type": s.type.value if hasattr(s.type, "value") else s.type,
#             "price": float(s.price) if isinstance(s.price, (int, float, Decimal)) else 0,
#             "city": s.city,
#             "state": s.state,
#             "images": [img.image_url for img in s.images] if s.images else []  # fetch image URLs
#         })

#     return {"services": response_data, "total_count": total_count}


# @router.put("/update/{service_id}", response_model=ServiceResponse)
# def update_service(
#     service_id: UUID,
#     service_data: ServiceUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_role(["vendor"]))
# ):
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")

#     update_data = service_data.dict(exclude_unset=True, exclude={"images"})

#     for key, value in update_data.items():
#         if key == "type" and value is not None:
#             value = ServiceType(value)
#         setattr(service, key, value)

#     # Handle images: replace existing ones
#     if service_data.images is not None:
#         db.query(ServiceImage).filter(ServiceImage.service_id == service_id).delete()
#         for url in service_data.images:
#             db_image = ServiceImage(service_id=service.id, image_url=url)
#             db.add(db_image)

#     db.commit()
#     db.refresh(service)
#     return service


# @router.delete("/delete/{service_id}")
# def delete_service(
#     service_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_role(["vendor"]))
# ):
#     # 1. Fetch the service
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")

#     # 2. Check ownership
#     if service.user_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not authorized")

#     # 3. Fetch related images
#     service_images = db.query(ServiceImage).filter(ServiceImage.service_id == service_id).all()
#     file_paths = [img.path for img in service_images]  # assumes image_url stores the Supabase path
#     # 4. Delete from Supabase storage
#     if file_paths:
#         try:
#             res = supabase.storage.from_("service-images").remove(file_paths)
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Error deleting files from storage: {str(e)}")

#     # 5. Delete images from DB
#     db.query(ServiceImage).filter(ServiceImage.service_id == service_id).delete()

#     # 6. Delete the service itself
#     db.delete(service)
#     db.commit()

#     return {
#         "message": "Service deleted successfully"
#     }