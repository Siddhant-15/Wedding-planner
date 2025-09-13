from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import uuid

from app.database import get_db
from app.models import Service, User, ServiceImage
from app.core.security import get_current_user, require_role
from app.schemas.services import ServiceCreate, ServiceUpdate, ServiceResponse, ServiceType

router = APIRouter(prefix="/services", tags=["Services"])


@router.post("/create", response_model=ServiceResponse)
def create_service(service: ServiceCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["vendor"]))):
    user_id = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Create service
    service_data = service.dict(exclude={"images"})
    service_data["type"] = service.type
    db_service = Service(**service_data, user_id=user_id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # Add images
    for url in service.images or []:
        db_image = ServiceImage(service_id=db_service.id, image_url=url)
        db.add(db_image)

    db.commit()
    db.refresh(db_service)
    return db_service



@router.get("/get-all", response_model=List[ServiceResponse])
def get_services(
    skip: int = 0,
    limit: int = Query(100, le=100),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    query = db.query(Service)
    if user_id:
        query = query.filter(Service.user_id == uuid.UUID(user_id))
    return query.offset(skip).limit(limit).all()


@router.put("/update/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: UUID,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    update_data = service_data.dict(exclude_unset=True, exclude={"images"})

    for key, value in update_data.items():
        if key == "type" and value is not None:
            value = ServiceType(value)
        setattr(service, key, value)

    # Handle images: replace existing ones
    if service_data.images is not None:
        db.query(ServiceImage).filter(ServiceImage.service_id == service_id).delete()
        for url in service_data.images:
            db_image = ServiceImage(service_id=service.id, image_url=url)
            db.add(db_image)

    db.commit()
    db.refresh(service)
    return service

@router.delete("/delete/{service_id}")
def delete_service(
    service_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Check ownership
    if service.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this service")

    # Get related images
    images = db.query(ServiceImage).filter(ServiceImage.service_id == service_id).all()

    # Delete service and images from DB
    db.query(ServiceImage).filter(ServiceImage.service_id == service_id).delete()
    db.delete(service)
    db.commit()

    # Return image URLs so frontend can clean up storage
    image_urls = [img.image_url for img in images]
    return {
        "message": "Service deleted successfully",
        "image_urls": image_urls
    }

