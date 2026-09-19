
from decimal import Decimal

from pydantic import BaseModel, Field


class WithdrawalCreate(BaseModel):
    amount: Decimal = Field(
        ...,
        gt=0,
        description="Withdrawal amount in KES"
    )

    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=15,
        description="MPESA phone number"
    )

    payment_method: str = Field(
        default="MPESA",
        description="Withdrawal payment method"
    )


class WithdrawalResponse(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    withdrawal_fee: Decimal
    net_amount: Decimal
    payment_method: str
    phone_number: str
    status: str
    created_at: object
    completed_at: object | None = None

    class Config:
        from_attributes = True