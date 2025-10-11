from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.models import Vendor, User
from app.core.security import require_role
from pydantic import BaseModel
from typing import Optional

vendorrouter = APIRouter(prefix="/vendors", tags=["Vendors"])

class VendorOnboardingRequest(BaseModel):
    business_name: str
    business_description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    experience_years: Optional[int] = None
    website: Optional[str] = None


@vendorrouter.post("/onboarding")
def vendor_onboarding(
    data: VendorOnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    try:
        # Check if vendor profile already exists
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()

        if vendor:
            # Update existing profile (exclude is_verified to prevent overriding)
            update_data = data.dict(exclude_unset=True, exclude={"is_verified"})
            for field, value in update_data.items():
                setattr(vendor, field, value)

        else:
            # Create new vendor profile
            vendor = Vendor(
                user_id=current_user.id,
                business_name=data.business_name,
                business_description=data.business_description,
                city=data.city,
                state=data.state,
                country=data.country,
                pincode=data.pincode,
                experience_years=data.experience_years,
                website=data.website,
                is_verified=False,  # always False at creation
                contact_person=f"{current_user.first_name} {current_user.last_name}".strip(),
                phone=current_user.customer_profile.phone if current_user.customer_profile else None,
            )
            db.add(vendor)

        db.commit()
        db.refresh(vendor)

        return {
            "message": "Vendor onboarding successful"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process vendor onboarding: {str(e)}"
        )


@vendorrouter.get("/status")
def vendor_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()

    if not vendor:
        return {"onboarding_completed": False}

    # Check required fields
    required_fields = [vendor.business_name, vendor.city, vendor.state]
    if any(field is None or field == "" for field in required_fields):
        return {"onboarding_completed": False}

    return {
        "onboarding_completed": True,
        "business_name": vendor.business_name,
        "is_verified": vendor.is_verified
    }