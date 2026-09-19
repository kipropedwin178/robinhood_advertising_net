from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# ADMIN USER RESPONSE
# =========================================================

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone_number: str | None = None
    balance: float = 0.0
    referral_code: str
    referred_by: int | None = None
    role: str
    is_active: bool
    

    model_config = {
        "from_attributes": True
    }

# =========================================================
# ADMIN USER DETAIL RESPONSE
# =========================================================

class AdminMembershipResponse(BaseModel):
    id: int
    level: int
    activation_fee: float
    earnings: float
    started_at: datetime
    expires_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class AdminUserDetailResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone_number: str | None = None
    referral_code: str
    referred_by: int | None = None
    role: str
    is_active: bool

    balance: float
    total_earned: float
    total_withdrawn: float

    active_memberships: list[AdminMembershipResponse] = []

    model_config = {
        "from_attributes": True
    }

# =========================================================
# ADMIN USER UPDATE
# =========================================================

class AdminUserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=50
    )

    email: EmailStr | None = None

    phone_number: str | None = Field(
        default=None,
        min_length=10,
        max_length=15
    )

    role: str | None = None

    is_active: bool | None = None


# =========================================================
# ADMIN BALANCE UPDATE
# =========================================================

class AdminBalanceUpdate(BaseModel):
    amount: float = Field(
        description="Amount to add or subtract from the user's balance"
    )

    reason: str = Field(
        min_length=3,
        max_length=255
    )


# =========================================================
# ADMIN PASSWORD RESET
# =========================================================

class AdminPasswordReset(BaseModel):
    new_password: str = Field(
        min_length=8,
        max_length=128
    )


# =========================================================
# ADMIN WITHDRAWAL RESPONSE
# =========================================================

class AdminWithdrawalResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    withdrawal_fee: float
    net_amount: float
    payment_method: str
    phone_number: str
    status: str
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }


# =========================================================
# ADMIN WITHDRAWAL REJECTION
# =========================================================

class AdminWithdrawalReject(BaseModel):
    reason: str = Field(
        min_length=3,
        max_length=255
    )