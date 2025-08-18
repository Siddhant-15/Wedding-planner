# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenPair, RefreshRequest
from app.core import security
from app.config import settings

router = APIRouter()

@router.post("/signup", response_model=TokenPair)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check existing user
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = security.hash_password(data.password)
    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        hashed_password=hashed_password,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate tokens
    access_token = security.create_access_token(new_user.id)
    refresh_token = security.create_refresh_token(new_user.id)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    print("This is what i get:",data)
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not security.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = security.create_access_token(user.id)
    refresh_token = security.create_refresh_token(user.id)

    print("access_token:",access_token)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/refresh", response_model=TokenPair)
def refresh_token(data: RefreshRequest):
    payload = security.decode_token(data.refresh_token, refresh=True)
    if not payload or not payload.sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access_token = security.create_access_token(payload.sub)
    refresh_token = security.create_refresh_token(payload.sub)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
