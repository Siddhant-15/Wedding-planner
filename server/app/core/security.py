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
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, int], expires_delta: int = None) -> str:
    if expires_delta is None:
        expires_delta = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: Union[str, int], expires_delta: int = None) -> str:
    if expires_delta is None:
        expires_delta = settings.REFRESH_TOKEN_EXPIRE_DAYS * 1440
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str, refresh: bool = False) -> TokenPayload:
    secret = settings.JWT_REFRESH_SECRET_KEY if refresh else settings.JWT_SECRET_KEY
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.ALGORITHM])
        return TokenPayload(sub=payload.get("sub"), exp=payload.get("exp"))
    except (JWTError, ValidationError):
        return None

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
        payload = decode_token(token)
        if payload is None or payload.sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user: Optional[User] = db.query(User).filter(User.id == int(payload.sub)).first()
    if user is None:
        raise credentials_exception
    return user