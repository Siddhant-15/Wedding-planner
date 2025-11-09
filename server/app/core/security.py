# app/core/security.py
from datetime import datetime, timedelta
from typing import Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import ValidationError
from app.schemas.auth import TokenPayload
from app.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
import uuid

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, int],role: str, expires_delta: int = None) -> str:
    if expires_delta is None:
        expires_delta = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: Union[str, int],role: str, expires_delta: int = None) -> str:
    if expires_delta is None:
        expires_delta = settings.REFRESH_TOKEN_EXPIRE_DAYS * 1440
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str, refresh: bool = False) -> TokenPayload:
    secret = settings.JWT_REFRESH_SECRET_KEY if refresh else settings.JWT_SECRET_KEY
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.ALGORITHM])
        return TokenPayload(sub=payload.get("sub"), role=payload.get("role"), exp=payload.get("exp"))
    except (JWTError, ValidationError):
        return None


def require_role(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)):
        user_roles = [user_role.role.name for user_role in user.roles if user_role.role]
        print("User Roles",user_roles)
        if not user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You don't have any role assigned"
            )
        print("Allowed Roles",allowed_roles)
        if not any(role in allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Requires role in {allowed_roles}, but you have {user_roles}"
            )
        print("User",user)
        return user
    return role_checker

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print("Token",token)
        payload = decode_token(token)
        if payload is None or payload.sub is None:
            print("Payload is None or Payload.sub is None")
            raise credentials_exception
    except JWTError:
        print("JWTError")
        raise credentials_exception

    try:
        user_id = uuid.UUID(payload.sub)
        print("User ID",user_id)
    except Exception:
        print("Exception")
        raise credentials_exception
    user: Optional[User] = db.query(User).filter(User.id == user_id).first()
    if user is None:
        print("User is None")
        raise credentials_exception
    return user