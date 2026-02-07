# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Union

from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import ValidationError

from app.config import settings
from app.schemas.auth import TokenPayload

# ─── Password Hashing ────────────────────────────────────────────────
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__type="id",               # Argon2id – best hybrid variant
    argon2__memory_cost=65536,       # 64 MiB – OWASP 2025 baseline
    argon2__time_cost=3,             # ~0.5s on modern CPU
    argon2__parallelism=4,           # Use up to 4 threads
    argon2__hash_len=32,
)

def hash_password(password: str) -> str:
    """Hash password with Argon2id (auto-salts + PHC format)"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored Argon2 hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT Tokens ──────────────────────────────────────────────────────
def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": subject,          # email (better for separate customer/vendor tables)
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": subject,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",       # marker to distinguish
    }
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, refresh: bool = False) -> TokenPayload | None:
    secret = settings.JWT_REFRESH_SECRET_KEY if refresh else settings.JWT_SECRET_KEY
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except (JWTError, ValidationError):
        return None