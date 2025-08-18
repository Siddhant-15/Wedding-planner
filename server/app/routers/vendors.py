# app/routers/vendor.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter()

# Create Vendor
@router.post("/", response_model=schemas.VendorOut, status_code=status.HTTP_201_CREATED)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    # Check if vendor already exists for the user
    existing_vendor = db.query(models.Vendor).filter(models.Vendor.user_id == vendor.user_id).first()
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Vendor profile already exists for this user.")

    new_vendor = models.Vendor(**vendor.dict())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


# Get Vendor by ID
@router.get("/{vendor_id}", response_model=schemas.VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")
    return vendor


# Update Vendor
@router.put("/{vendor_id}", response_model=schemas.VendorOut)
def update_vendor(vendor_id: int, vendor_update: schemas.VendorUpdate, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")

    for key, value in vendor_update.dict(exclude_unset=True).items():
        setattr(vendor, key, value)

    db.commit()
    db.refresh(vendor)
    return vendor


# Delete Vendor
@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")

    db.delete(vendor)
    db.commit()
    return None


# Get All Vendors
@router.get("/", response_model=List[schemas.VendorOut])
def get_all_vendors(db: Session = Depends(get_db)):
    return db.query(models.Vendor).all()
