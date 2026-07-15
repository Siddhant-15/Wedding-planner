"""
app/controller/Admin/admin_auth_controller.py

Admin authentication business logic.
"""

from __future__ import annotations

import logging

from fastapi import HTTPException, Response, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.config import settings
from app.repositories.admin.admin_repository import get_admin_by_email, get_admin_by_id, create_admin
from app.schemas.admin.auth import AdminLogin, AdminPasswordChange, AdminToken, AdminSignup

logger = logging.getLogger(__name__)


async def admin_login_controller(
    data: AdminLogin,
    db,
    response: Response,
) -> AdminToken:
    admin = await get_admin_by_email(db, data.email)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin account not found",
        )

    if not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

    access_token  = create_access_token(subject=admin.email, role="admin")
    refresh_token = create_refresh_token(subject=admin.email, role="admin")

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86_400,
        path="/",
    )

    logger.info("Admin login: %s (role=%s)", admin.email, admin.role)

    return AdminToken(
        access_token=access_token,
        role=admin.role,
        admin_id=admin.id,
        email=admin.email,
    )

async def admin_signup_controller(
    data: AdminSignup,
    db,
    response,
) -> AdminToken:
    """
    Create new admin account.
    """

    existing_admin = await get_admin_by_email(
        db,
        data.email,
    )

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists",
        )

    admin = await create_admin(
        db=db,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="admin",
        first_name = data.first_name,
        last_name=data.last_name
    )

    access_token = create_access_token(
        subject=admin.email,
        role="admin",
    )

    refresh_token = create_refresh_token(
        subject=admin.email,
        role="admin",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return AdminToken(
        access_token=access_token,
        role=admin.role,
        admin_id=admin.id,
        email=admin.email,
    )


async def admin_refresh_controller(request) -> dict:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = decode_token(refresh_token, refresh=True)
    if not payload or payload.type != "refresh" or payload.role != "admin":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access_token = create_access_token(subject=str(payload.sub), role="admin")
    return {"access_token": access_token}


async def admin_change_password_controller(
    data: AdminPasswordChange,
    current_admin: dict,
    db,
) -> dict:
    admin = await get_admin_by_id(db, current_admin["id"])
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if not verify_password(data.current_password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    admin.hashed_password = hash_password(data.new_password)
    await db.commit()

    logger.info("Admin password changed: id=%s", admin.id)
    return {"message": "Password updated successfully"}