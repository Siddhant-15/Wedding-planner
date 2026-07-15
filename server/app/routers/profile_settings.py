from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import mimetypes
from datetime import datetime
import logging
from typing import Optional

from app.db.db import get_db
from app.models.models import Customer, Vendor
from app.dependencies.auth import get_current_user
from app.schemas.profile_settings import UserResponse
from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/me", response_model=UserResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    model = Customer if current_user["role"] == "customer" else Vendor
    result = await db.execute(select(model).where(model.id == current_user["id"]))
    user_record = result.scalar_one_or_none()
    
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user_record


@user_router.put("/me", response_model=UserResponse)
async def update_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form("India"),
    business_name: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    model = Customer if current_user["role"] == "customer" else Vendor
    result = await db.execute(select(model).where(model.id == current_user["id"]))
    user_record = result.scalar_one_or_none()
    
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    # Handle avatar upload if provided
    avatar_url = user_record.avatar
    if avatar:
        file_bytes = await avatar.read()
        file_ext = avatar.filename.split(".")[-1].lower() if "." in avatar.filename else "jpg"
        file_path = f"avatars/{current_user['id']}/{uuid.uuid4().hex}.{file_ext}"
        
        content_type, _ = mimetypes.guess_type(avatar.filename)
        if not content_type:
            content_type = "image/jpeg"
            
        supabase.storage.from_("user-avatars").upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        
        public_url = supabase.storage.from_("user-avatars").get_public_url(file_path)
        avatar_url = public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)

    # Update base fields
    user_record.first_name = first_name
    user_record.last_name = last_name
    user_record.phone = phone
    user_record.city = city
    user_record.state = state
    user_record.country = country
    user_record.avatar = avatar_url
    
    # Update vendor specific fields safely
    if current_user["role"] == "vendor" and business_name:
        user_record.business_name = business_name
        
    user_record.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(user_record)
    
    return user_record

from pydantic import BaseModel
class VerifyOTP(BaseModel):
    code: str

@user_router.post("/send-verification")
async def send_verification_email(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # In a real app, send email with OTP. Here we just pretend.
    return {"message": "Verification code sent to your email (dummy: use 123456)"}

@user_router.post("/verify", response_model=UserResponse)
async def verify_email(
    otp: VerifyOTP,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    model = Customer if current_user["role"] == "customer" else Vendor
    result = await db.execute(select(model).where(model.id == current_user["id"]))
    user_record = result.scalar_one_or_none()
    
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_record.is_verified:
        raise HTTPException(status_code=400, detail="Already verified")
        
    if otp.code != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    user_record.is_verified = True
    await db.commit()
    await db.refresh(user_record)
    
    return user_record
