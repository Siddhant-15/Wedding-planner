# ─────────────────────────────────────────────────────────────────────────────
# app/core/security.py
# Production-ready authentication + RBAC + upload security
# ─────────────────────────────────────────────────────────────────────────────

from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlparse
import ipaddress

from fastapi import (
    Depends,
    HTTPException,
    Security,
    WebSocket,
    Query,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import JWTError, jwt

from passlib.context import CryptContext

from pydantic import ValidationError

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.infrastructure.db.session import get_db

# update according to your schema paths
from app.schemas.auth import TokenPayload

# update according to your ORM paths
from app.infrastructure.db.models.models import (
    Customer,
    Vendor,
    Service,
)

# ─────────────────────────────────────────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────────────────────────────────────────

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",

    # Argon2id
    argon2__type="id",

    # OWASP-grade defaults
    argon2__memory_cost=65536,
    argon2__time_cost=3,
    argon2__parallelism=4,

    argon2__hash_len=32,
)


def hash_password(password: str) -> str:
    """
    Hash password using Argon2id.
    """

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify password against stored hash.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ─────────────────────────────────────────────────────────────────────────────
# JWT HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    role: str,
    user_id: Optional[int] = None,
) -> str:

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "role": role,
        "id": user_id,

        "type": "access",

        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_refresh_token(
    subject: str,
    role: str,
    user_id: Optional[int] = None,
) -> str:

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": subject,
        "role": role,
        "id": user_id,

        "type": "refresh",

        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_REFRESH_SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(
    token: str,
    refresh: bool = False,
) -> Optional[TokenPayload]:

    secret = (
        settings.JWT_REFRESH_SECRET_KEY
        if refresh
        else settings.JWT_SECRET_KEY
    )

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.ALGORITHM],
        )

        return TokenPayload(**payload)

    except (JWTError, ValidationError):
        return None


# ─────────────────────────────────────────────────────────────────────────────
# FASTAPI AUTH
# ─────────────────────────────────────────────────────────────────────────────

security = HTTPBearer(
    scheme_name="Bearer Token",
    description="Paste your JWT access token",
    auto_error=False,
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(
        security
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Validate JWT token + fetch actual user from DB.
    """

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.sub
    role = payload.role

    # ── DB Lookup ──────────────────────────────────────────────────────────

    if role == "customer":
        stmt = select(Customer).where(
            Customer.email == email
        )

    elif role == "vendor":
        stmt = select(Vendor).where(
            Vendor.email == email
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid role",
        )

    result = await db.execute(stmt)

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "id": user.id,
        "email": user.email,
        "role": role,
        "is_verified": getattr(user, "is_verified", False),
    }


# ─────────────────────────────────────────────────────────────────────────────
# WEBSOCKET AUTH
# ─────────────────────────────────────────────────────────────────────────────

async def get_current_user_ws(
    websocket: WebSocket,
    token: str = Query(...),
):

    payload = decode_token(token)

    if not payload:
        await websocket.close(code=1008)
        return None

    return {
        "id": payload.id,
        "email": payload.sub,
        "role": payload.role,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROLE-BASED ACCESS CONTROL
# ─────────────────────────────────────────────────────────────────────────────

def require_role(*roles: str):

    async def _checker(
        current_user=Depends(get_current_user),
    ):

        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return _checker


require_vendor = require_role("vendor")

require_customer = require_role("customer")

require_admin = require_role("admin")

require_any = require_role(
    "vendor",
    "customer",
    "admin",
)


# ─────────────────────────────────────────────────────────────────────────────
# SERVICE OWNERSHIP CHECK
# ─────────────────────────────────────────────────────────────────────────────

async def assert_service_owner(
    service_id: int,
    vendor_id: int,
    db: AsyncSession,
) -> None:
    """
    Prevent vendors editing others' services.
    """

    result = await db.execute(
        select(Service.id).where(
            Service.id == service_id,
            Service.vendor_id == vendor_id,
        )
    )

    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )


# ─────────────────────────────────────────────────────────────────────────────
# SSRF PROTECTION
# ─────────────────────────────────────────────────────────────────────────────

def validate_external_url(url: str) -> None:
    """
    Prevent SSRF attacks.
    """

    parsed = urlparse(url)

    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=400,
            detail="Only http/https URLs allowed",
        )

    host = parsed.hostname or ""

    try:
        ip = ipaddress.ip_address(host)

        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_reserved
            or ip.is_link_local
            or ip.is_multicast
        ):
            raise HTTPException(
                status_code=400,
                detail="Private/internal URLs are not allowed",
            )

    except ValueError:
        # hostname instead of raw IP
        pass


# ─────────────────────────────────────────────────────────────────────────────
# FILE VALIDATION
# ─────────────────────────────────────────────────────────────────────────────

def validate_file_size(
    size_bytes: int,
    media_type: str,
) -> None:

    size_mb = size_bytes / (1024 * 1024)

    if media_type.startswith("image"):
        if size_mb > settings.MAX_IMAGE_MB:
            raise HTTPException(
                status_code=400,
                detail=f"Image exceeds {settings.MAX_IMAGE_MB}MB limit",
            )

    if media_type.startswith("video"):
        if size_mb > settings.MAX_VIDEO_MB:
            raise HTTPException(
                status_code=400,
                detail=f"Video exceeds {settings.MAX_VIDEO_MB}MB limit",
            )


def validate_content_type(content_type: str) -> None:

    allowed = (
        settings.ALLOWED_IMAGE_TYPES
        + settings.ALLOWED_VIDEO_TYPES
    )

    if content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type",
        )



optional_bearer = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Security(
        optional_bearer
    ),
    db: AsyncSession = Depends(get_db),
):
    if not credentials:
        return None

    return await get_current_user(
        credentials=credentials,
        db=db,
    )