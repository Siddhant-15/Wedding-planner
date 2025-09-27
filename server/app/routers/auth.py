# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenPair, RefreshRequest, GoogleLoginRequest
from app.core import security
from app.config import settings
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

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
        password=hashed_password,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate tokens
    access_token = security.create_access_token(new_user.id,new_user.role)
    refresh_token = security.create_refresh_token(new_user.id, new_user.role)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not security.verify_password(data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.role != data.role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role for this login")

    access_token = security.create_access_token(user.id, user.role)
    refresh_token = security.create_refresh_token(user.id, user.role)

    print("access_token:",access_token)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/google-login", response_model=TokenPair)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Verify Google ID token
        idinfo = google_id_token.verify_oauth2_token(
            data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extra safety checks
        if idinfo["aud"] != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid Google audience")

        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(status_code=401, detail="Invalid Google issuer")

        google_user_id = idinfo["sub"]
        email = idinfo["email"]
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # Check if user exists
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create new user with OAuth flag
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=data.role,
            password=security.hash_password("google-oauth-dummy"),
            is_oauth=True  # Add this column in your User model
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    elif user.role != data.role:
        # Prevent logging in with wrong role
        raise HTTPException(status_code=403, detail="Invalid role for this account")

    # Generate JWTs
    access_token = security.create_access_token(user.id, user.role)
    refresh_token = security.create_refresh_token(user.id, user.role)

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

    access_token = security.create_access_token(payload.sub, payload.role)
    refresh_token = security.create_refresh_token(payload.sub, payload.role)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
