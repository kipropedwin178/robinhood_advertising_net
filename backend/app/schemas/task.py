from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255
    )

    description: str = Field(
        min_length=1
    )

    advertisement_link: str = Field(
        min_length=1,
        max_length=1000
    )

    membership_level: int = Field(
        ge=1,
        le=6
    )

    reward_amount: float = Field(
        gt=0
    )


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    description: str | None = Field(
        default=None,
        min_length=1
    )

    advertisement_link: str | None = Field(
        default=None,
        min_length=1,
        max_length=1000
    )

    membership_level: int | None = Field(
        default=None,
        ge=1,
        le=6
    )

    reward_amount: float | None = Field(
        default=None,
        gt=0
    )


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    advertisement_link: str
    membership_level: int
    reward_amount: float
    is_active: bool
    is_deleted: bool
    created_at: datetime