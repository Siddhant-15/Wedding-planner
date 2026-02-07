from sqlalchemy import Column, String, Text, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import timedelta
import random


# Schemas (schemas.py) - Assuming Pydantic models


# Backend Routes (routers/user.py or similar)
# Assume you have: from ..auth import get_current_user, oauth2_scheme
# Also, import supabase for avatar upload, like previous
# For OTP, generate random 6-digit, store with expiration (5 min), log for dev

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserUpdate, UserResponse, OTPResponse, VerifyOTP
from ..supabase_client import supabase  # Your Supabase client
import uuid
import mimetypes
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@user_router.put("/me", response_model=UserResponse)
async def update_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    location: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate input
    update_data = UserUpdate(first_name=first_name, last_name=last_name, location=location, phone=phone)
    
    # Handle avatar upload if provided
    avatar_url = current_user.avatar
    if avatar:
        if avatar.size > 2 * 1024 * 1024:  # 2MB limit
            raise HTTPException(413, detail="Avatar file too large (max 2MB)")
        
        file_bytes = await avatar.read()
        file_ext = avatar.filename.split(".")[-1].lower() if "." in avatar.filename else "jpg"
        file_path = f"avatars/{current_user.id}/{uuid.uuid4().hex}.{file_ext}"
        
        content_type, _ = mimetypes.guess_type(avatar.filename)
        if not content_type or not content_type.startswith("image/"):
            raise HTTPException(400, detail="Invalid image file")
        
        supabase.storage.from_("user-avatars").upload(  # Assume bucket 'user-avatars'
            path=file_path,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        
        public_url = supabase.storage.from_("user-avatars").get_public_url(file_path)
        avatar_url = public_url.get("publicURL") if isinstance(public_url, dict) else str(public_url)

    # Update user
    current_user.first_name = update_data.first_name
    current_user.last_name = update_data.last_name
    current_user.location = update_data.location
    current_user.phone = update_data.phone
    current_user.avatar = avatar_url
    current_user.updated_at = datetime.now()
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@user_router.post("/send-verification", response_model=OTPResponse)
async def send_verification_email(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_verified:
        raise HTTPException(400, detail="Email already verified")
    
    # Generate OTP
    otp = f"{random.randint(100000, 999999)}"
    expires = datetime.now() + timedelta(minutes=5)
    
    current_user.verification_code = otp
    current_user.verification_expires = expires
    db.commit()
    
    # TODO: Implement email sending here (e.g., with smtplib or SendGrid)
    # For now, log OTP for manual entry
    logger.info(f"Verification OTP for {current_user.email}: {otp} (expires {expires})")
    
    return {"message": "Verification code sent to your email (check logs for dev)"}

@user_router.post("/verify", response_model=UserResponse)
async def verify_email(
    otp: VerifyOTP,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_verified:
        raise HTTPException(400, detail="Email already verified")
    
    if not current_user.verification_code or current_user.verification_expires < datetime.now():
        raise HTTPException(400, detail="Invalid or expired verification code")
    
    if current_user.verification_code != otp.code:
        raise HTTPException(400, detail="Incorrect verification code")
    
    # Verify
    current_user.is_verified = True
    current_user.verification_code = None
    current_user.verification_expires = None
    db.commit()
    db.refresh(current_user)
    
    return current_user