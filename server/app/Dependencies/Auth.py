# app/dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated

from app.config import settings
from app.core.security import decode_token
from app.Db.db import get_db_session
from app.models.models import Customer, Vendor
from app.schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,  # manual handling for better messages
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    token_data = decode_token(token)
    if not token_data or not token_data.sub:
        raise credentials_exception

    # Lookup in correct table based on role claim
    if token_data.role == "customer":
        stmt = select(Customer).where(Customer.email == token_data.sub)
    elif token_data.role == "vendor":
        stmt = select(Vendor).where(Vendor.email == token_data.sub)
    else:
        raise credentials_exception

    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    # Optional: check token freshness vs last password change
    # if user.updated_at > datetime.fromtimestamp(token_data.iat, tz=timezone.utc):
    #     raise credentials_exception

    return {
        "id": user.id,
        "email": user.email,
        "role": token_data.role,
        "is_verified": user.is_verified,
        # add phone, name, etc. if needed often
    }