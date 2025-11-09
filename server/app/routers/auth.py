from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Role, UserRole
from app.schemas.auth import UserLogin, Token, CustomerSignup, VendorSignup
from app.core import security
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import BaseModel, EmailStr
import logging

# -------------------- Logging --------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])


# -------------------- Helper --------------------
def _get_role(db: Session, name: str):
    role = db.query(Role).filter(Role.name == name).one_or_none()
    if not role:
        logger.error(f"Role '{name}' not configured in database.")
        raise HTTPException(status_code=500, detail=f"Role '{name}' is not configured.")
    return role


# -------------------- RESET PASSWORD INPUT --------------------
class ResetPasswordIn(BaseModel):
    email: EmailStr
    new_password: str
    role: str  # "customer" or "vendor"


# -------------------- SIGNUP (CUSTOMER/VENDOR) --------------------
def _signup(user_in, role_name: str, db: Session):
    # Pre-checks
    print("1")
    user = db.query(User).filter(User.email == user_in.email).first()
    role = _get_role(db, role_name)

    if user:
        if not security.verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail=f"Email already registered. Please reset your password to add {role_name} access."
            )
        if db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first():
            raise HTTPException(
                status_code=400,
                detail=f"User already has {role_name} access."
            )

    # Add user / role without nested transaction
    try:
        if user:
            db.add(UserRole(user_id=user.id, role_id=role.id))
        else:
            user = User(
                email=user_in.email,
                first_name=getattr(user_in, "first_name", ""),
                last_name=getattr(user_in, "last_name", ""),
                hashed_password=security.hash_password(user_in.password)
            )
            db.add(user)
            db.flush()
            db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()  # commit here explicitly
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during {role_name} signup: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error during signup.")

    # Generate tokens
    roles = [r[0] for r in db.query(Role.name)
             .join(UserRole, Role.id == UserRole.role_id)
             .filter(UserRole.user_id == user.id).all()]
    access_token = security.create_access_token(subject=str(user.id), role=roles)
    refresh_token = security.create_refresh_token(subject=str(user.id), role=roles)

    return {"access_token": access_token, "refresh_token": refresh_token}



@router.post("/signup/customer", response_model=Token)
def customer_signup(customer_in: CustomerSignup, db: Session = Depends(get_db)):
    return _signup(customer_in, "customer", db)


@router.post("/signup/vendor", response_model=Token)
def vendor_signup(vendor_in: VendorSignup, db: Session = Depends(get_db)):
    return _signup(vendor_in, "vendor", db)


# -------------------- RESET PASSWORD --------------------
@router.post("/reset-password", response_model=Token)
def reset_password(reset_in: ResetPasswordIn, db: Session = Depends(get_db)):
    try:
        with db.begin():
            user = db.query(User).filter(User.email == reset_in.email).first()
            if not user:
                raise HTTPException(status_code=404, detail="Email not found. Cannot reset password.")

            # Update password
            user.hashed_password = security.hash_password(reset_in.new_password)
            db.add(user)

            # Add role if not exists
            role = _get_role(db, reset_in.role)
            if not db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first():
                db.add(UserRole(user_id=user.id, role_id=role.id))
                logger.info(f"Added role '{reset_in.role}' for user {user.email} after password reset.")

        # Generate tokens
        roles = [r[0] for r in db.query(Role.name)
                 .join(UserRole, Role.id == UserRole.role_id)
                 .filter(UserRole.user_id == user.id).all()]
        print("Roles",roles)
        access_token = security.create_access_token(subject=str(user.id), role=roles)
        refresh_token = security.create_refresh_token(subject=str(user.id), role=roles)

        logger.info(f"Password reset successful for user {user.email}.")
        return {"access_token": access_token, "refresh_token": refresh_token}

    except HTTPException as e:
        raise e
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during password reset: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error during password reset.")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during password reset: {str(e)}")
        raise HTTPException(status_code=500, detail="Password reset failed due to unexpected error.")


# -------------------- LOGIN --------------------
@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.email).first()
        if not user:
            logger.info(f"Login failed: email {form_data.email} not found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email does not exist. Please sign up first."
            )

        if not security.verify_password(form_data.password, user.hashed_password):
            logger.info(f"Login failed: incorrect password for email {form_data.email}.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password. Please try again."
            )

        # 🔑 Fetch all roles of the user
        roles = (
            db.query(Role.name)
            .join(UserRole, Role.id == UserRole.role_id)
            .filter(UserRole.user_id == user.id)
            .all()
        )
        role_names = [r[0] for r in roles]

        # 🔑 Validate requested role
        requested_role = form_data.role.strip().lower()
        if requested_role not in role_names:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You are not authorized as {requested_role}. Available roles: {role_names}"
            )

        print("Role Names",requested_role)
        # Generate tokens
        access_token = security.create_access_token(subject=str(user.id), role=requested_role)
        refresh_token = security.create_refresh_token(subject=str(user.id), role=requested_role)

        logger.info(f"User {user.email} logged in successfully with roles: {role_names}.")
        return {"access_token": access_token, "refresh_token": refresh_token}

    except HTTPException as e:
        raise e
    except SQLAlchemyError as e:
        logger.error(f"Database error during login for {form_data.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error during login.")
    except Exception as e:
        logger.error(f"Unexpected error during login for {form_data.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed due to unexpected error.")
