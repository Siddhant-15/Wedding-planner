from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.models import Vendor
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional

vendorrouter = APIRouter(prefix="/vendors", tags=["Vendors"])

class VendorOnboardingRequest(BaseModel):
    business_name: str
    business_description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    add_line1: Optional[str] = None
    add_line2: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    experience_years: Optional[int] = None
    contact_person: Optional[str] = None
    website: Optional[str] = None
    avatar: Optional[str] = None


@vendorrouter.post("/onboarding")
async def vendor_onboarding(
    data: VendorOnboardingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await db.execute(select(Vendor).filter(Vendor.id == current_user["id"]))
        vendor = result.scalar_one_or_none()

        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")

        update_data = data.dict(exclude_unset=True, exclude={"is_verified"})
        for field, value in update_data.items():
            setattr(vendor, field, value)

        await db.commit()
        await db.refresh(vendor)

        return {
            "message": "Vendor onboarding successful"
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process vendor onboarding: {str(e)}"
        )


@vendorrouter.get("/status")
async def vendor_status(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Vendor).filter(Vendor.id == current_user["id"]))
    vendor = result.scalar_one_or_none()

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