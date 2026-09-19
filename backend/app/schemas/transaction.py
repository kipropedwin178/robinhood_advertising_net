from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class TransactionResponse(BaseModel):

    id: int

    transaction_type: str

    amount: Decimal

    description: str

    status: str

    reference_type: str | None = None

    reference_id: int | None = None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )