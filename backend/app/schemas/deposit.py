
from decimal import Decimal

from pydantic import BaseModel, Field


class DepositCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        decimal_places=2
    )

    payment_method: str = Field(
        default="MPESA",
        min_length=2,
        max_length=50
    )


class DepositResponse(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    payment_method: str
    status: str
    referral_bonus: Decimal
    is_first_deposit: bool

    model_config = {
        "from_attributes": True
    }