from datetime import datetime

from pydantic import BaseModel


class AdminWithdrawalResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    rbh_number: str
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


class AdminWithdrawalAction(BaseModel):
    reason: str | None = None