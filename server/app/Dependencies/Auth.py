# app/dependencies/auth.py (or wherever it is)
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.Db.db import get_db
from app.models.models import Customer, Vendor

security = HTTPBearer(
    scheme_name="Bearer Token",
    description="Paste your JWT access token (from /auth/login)",
    auto_error=False
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Validates JWT access token and returns user info (email + role).
    Raises 401 if token is missing/invalid/expired.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Define the exception object here (before any raise)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role not in ("customer", "vendor"):
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Lookup user in correct table based on role
    if role == "customer":
        stmt = select(Customer).where(Customer.email == email)
    elif role == "vendor":
        stmt = select(Vendor).where(Vendor.email == email)
    else:
        raise credentials_exception

    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return {
        "id": user.id,
        "email": user.email,
        "role": role,
        "is_verified": user.is_verified,
    }