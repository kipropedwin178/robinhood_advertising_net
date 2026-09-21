from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=50
    )

    email: EmailStr

    phone_number: str = Field(
        min_length=10,
        max_length=15
    )

    password: str = Field(
        min_length=8
    )


class UserResponse(BaseModel):

    id: int

    username: str

    email: EmailStr

    phone_number: str | None = None

    referral_code: str

    profile_photo_url: str | None = None

    role: str

    is_active: bool

    created_at: datetime

    model_config = {
        "from_attributes": True
    }