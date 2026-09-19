from datetime import datetime

from pydantic import BaseModel, Field


class AdminMembershipLevelCreate(BaseModel):

    level: int = Field(
        ge=1,
        le=12
    )

    product_name: str = Field(
        min_length=1,
        max_length=255
    )

    product_photo: str | None = Field(
        default=None,
        max_length=1000
    )

    description: str = Field(
        min_length=1
    )

    product_price: float = Field(
        gt=0
    )

    release_date: str = Field(
        min_length=1,
        max_length=100
    )

    activation_fee: float = Field(
        gt=0
    )

    daily_reward: float = Field(
        gt=0
    )

    cycle_days: int = Field(
        gt=0
    )

    advertisement_message: str = Field(
        min_length=1
    )


class AdminMembershipLevelUpdate(BaseModel):

    product_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    product_photo: str | None = Field(
        default=None,
        max_length=1000
    )

    description: str | None = Field(
        default=None,
        min_length=1
    )

    product_price: float | None = Field(
        default=None,
        gt=0
    )

    release_date: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    activation_fee: float | None = Field(
        default=None,
        gt=0
    )

    daily_reward: float | None = Field(
        default=None,
        gt=0
    )

    cycle_days: int | None = Field(
        default=None,
        gt=0
    )

    advertisement_message: str | None = Field(
        default=None,
        min_length=1
    )

    is_active: bool | None = None


class AdminMembershipLevelResponse(BaseModel):

    id: int

    level: int

    product_name: str

    product_photo: str | None

    description: str

    product_price: float

    release_date: str

    activation_fee: float

    daily_reward: float

    cycle_days: int

    advertisement_message: str

    is_active: bool

    is_deleted: bool

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True