from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AdminTransactionResponse(BaseModel):
    id: int
    user_id: int
    transaction_type: str
    amount: Decimal
    description: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }