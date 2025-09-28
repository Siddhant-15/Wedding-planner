from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.models.models import Role, UserRole
from app.schemas.auth import UserSignup, UserLogin, Token, UserResponse
from app.core import security
from app.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=Token)
def signup(user_in: UserSignup, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if phone already exists (if provided)
    if user_in.phone:
        existing_phone = db.query(User).filter(User.phone == user_in.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    hashed_pw = security.hash_password(user_in.password)

    user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed_pw,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Assign default "customer" role
    role_name = user_in.role or "customer"
    customer_role = db.query(Role).filter(Role.name == role_name).first()
    if not customer_role:
        raise HTTPException(status_code=400, detail="Invalid role specified")
    user_role = UserRole(user_id=user.id, role_id=customer_role.id)
    db.add(user_role)
    db.commit()

    # Generate tokens
    access_token = security.create_access_token(subject=str(user.id), role=role_name)
    refresh_token = security.create_refresh_token(subject=str(user.id), role=role_name)

    return Token(access_token=access_token, refresh_token=refresh_token)




@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Get user's role (first one if multiple)
    role = (
        db.query(Role.name)
        .join(UserRole, Role.id == UserRole.role_id)
        .filter(UserRole.user_id == user.id)
        .first()
    )
    role_name = role[0] if role else "customer"

    access_token = security.create_access_token(subject=str(user.id), role=role_name)
    refresh_token = security.create_refresh_token(subject=str(user.id), role=role_name)

    return Token(access_token=access_token, refresh_token=refresh_token)
