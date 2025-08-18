from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.services import ServiceCreate, ServiceUpdate, ServiceOut
from app.models.service import Service  # Completed import

router = APIRouter(
    prefix="/services",
    tags=["services"]
)

@router.post("/", response_model=ServiceOut)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # Check if vendor exists (optional, depending on your setup)
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == service.vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=400, detail="Vendor not found")
    
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/", response_model=List[ServiceOut])
def get_services(
    skip: int = 0,
    limit: int = Query(100, le=100),  # Limit to 100 max
    vendor_id: Optional[int] = Query(None, description="Filter by vendor ID"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    db: Session = Depends(get_db)
):
    query = db.query(Service)
    
    if vendor_id:
        query = query.filter(Service.vendor_id == vendor_id)
    if service_type:
        query = query.filter(Service.type == service_type)
    
    services = query.offset(skip).limit(limit).all()
    return services

@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, service: ServiceUpdate, db: Session = Depends(get_db)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "vendor_id" and value != db_service.vendor_id:
            db_vendor = db.query(models.Vendor).filter(models.Vendor.id == value).first()
            if not db_vendor:
                raise HTTPException(status_code=400, detail="New vendor not found")
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(db_service)
    db.commit()
    return {"detail": "Service deleted successfully"}