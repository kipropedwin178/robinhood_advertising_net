from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.core.referral import generate_referral_code
from app.core.security import hash_password, verify_password
from app.database.connection import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import UserCreate


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    ref: str | None = None,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Check if username, email, or phone already exists
    # -----------------------------------------------------

    existing_user = db.query(User).filter(
        (User.username == user_data.username) |
        (User.email == user_data.email) |
        (User.phone_number == user_data.phone_number)
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Username, email, or phone number "
                "already exists"
            )
        )


    # -----------------------------------------------------
    # Find referring user
    # -----------------------------------------------------

    referrer = None

    if ref:

        referrer = db.query(User).filter(
            User.referral_code == ref.upper()
        ).first()

        if not referrer:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid referral code"
            )


    # -----------------------------------------------------
    # Generate unique referral code
    # -----------------------------------------------------

    referral_code = generate_referral_code(db)


    # -----------------------------------------------------
    # Create user
    # -----------------------------------------------------

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        phone_number=user_data.phone_number,
        password_hash=hash_password(
            user_data.password
        ),
        referral_code=referral_code,
        referred_by=(
            referrer.id
            if referrer
            else None
        )
    )


    db.add(new_user)

    db.commit()

    db.refresh(new_user)


    # -----------------------------------------------------
    # Create wallet
    # -----------------------------------------------------

    wallet = Wallet(
        user_id=new_user.id
    )

    db.add(wallet)

    db.commit()


    # -----------------------------------------------------
    # Create JWT token
    # -----------------------------------------------------

    access_token = create_access_token({
        "sub": str(new_user.id),
        "role": new_user.role
    })


    # -----------------------------------------------------
    # Return token + user information
    # -----------------------------------------------------

    return {
        "message": "Account created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "phone_number": new_user.phone_number,
            "referral_code": new_user.referral_code,
            "role": new_user.role,
            "is_active": new_user.is_active
        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Find user by email
    # -----------------------------------------------------

    user = db.query(User).filter(
        User.email == form_data.username
    ).first()


    # -----------------------------------------------------
    # Verify email and password
    # -----------------------------------------------------

    if not user or not verify_password(
        form_data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


    # -----------------------------------------------------
    # Check account status
    # -----------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )


    # -----------------------------------------------------
    # Create JWT access token
    # -----------------------------------------------------

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }