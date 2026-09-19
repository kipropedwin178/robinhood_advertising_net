
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AdminDepositResponse(BaseModel):
    id: int
    user_id: int
    rbh_number: str
    amount: Decimal
    payment_method: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class AdminDepositAction(BaseModel):
    reason: str | None = None