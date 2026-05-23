# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
from datetime import datetime, timedelta

from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.models import Customer, Vendor, VendorSubscription
from app.schemas.auth import (
    CustomerSignup, VendorSignup, UserLogin, Token, ResetPasswordIn
)
from app.core.security import verify_password, hash_password
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.config import settings

logger = logging.getLogger(__name__)

AuthRouter = APIRouter(prefix="/auth", tags=["auth"])


async def _create_tokens(email: str, role: str):
    access_token = create_access_token(subject=email, role=role)
    refresh_token = create_refresh_token(subject=email, role=role)
    return access_token, refresh_token


@AuthRouter.post("/signup/customer", response_model=Token)
async def signup_customer(
    data: CustomerSignup,
    db: AsyncSession = Depends(get_db),          # ← fixed: get_db
    response: Response = None
):
    stmt = select(Customer).where(Customer.email == data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered as customer")

    new_customer = Customer(
        email=data.email,
        hashed_password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        # add other fields...
    )
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)

    access_token, refresh_token = await _create_tokens(data.email, "customer")

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return {"access_token": access_token}


@AuthRouter.post("/signup/vendor", response_model=Token)
async def signup_vendor(
    data: VendorSignup,
    db: AsyncSession = Depends(get_db),
    response: Response = None
):
    stmt = select(Vendor).where(Vendor.email == data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered as vendor")

    new_vendor = Vendor(
        email=data.email,
        hashed_password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        business_name=data.business_name or f"{data.first_name}'s Business",
        contact_person=data.contact_person,
        website=data.website,
        # add other fields...
    )
    db.add(new_vendor)
    await db.flush()

    free_subscription = VendorSubscription(
        vendor_id=new_vendor.id,
        subscription_id=1,  # Free plan
        started_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=3650),
        status="active"
    )

    db.add(free_subscription)

    await db.commit()
    await db.refresh(new_vendor)

    access_token, refresh_token = await _create_tokens(data.email, "vendor")

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return {"access_token": access_token}


@AuthRouter.post("/login", response_model=Token)
async def login(
    form_data: UserLogin,
    db: AsyncSession = Depends(get_db),
    response: Response = None
):
    model = Customer if form_data.role == "customer" else Vendor
    stmt = select(model).where(model.email == form_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, f"{form_data.role.capitalize()} with this email not found")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect password")

    access_token, refresh_token = await _create_tokens(form_data.email, form_data.role)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    logger.info(f"{form_data.role} login successful: {form_data.email}")
    return {"access_token": access_token}


@AuthRouter.post("/reset-password", response_model=Token)
async def reset_password(
    reset_in: ResetPasswordIn,
    db: AsyncSession = Depends(get_db),
    response: Response = None
):
    model = Customer if reset_in.role == "customer" else Vendor
    stmt = select(model).where(model.email == reset_in.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, f"{reset_in.role.capitalize()} with this email not found")

    user.hashed_password = hash_password(reset_in.new_password)
    await db.commit()

    access_token, refresh_token = await _create_tokens(reset_in.email, reset_in.role)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return {"access_token": access_token}

@AuthRouter.post("/refresh", response_model=Token)
async def refresh_access_token(
    request: Request,
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token missing")
    
    payload = decode_token(refresh_token, refresh=True)
    if not payload or payload.type != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
        
    access_token = create_access_token(subject=str(payload.sub), role=payload.role)
    return {"access_token": access_token}