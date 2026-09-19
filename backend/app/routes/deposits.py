
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.deposit import DepositCreate
from app.services.deposit import create_deposit


router = APIRouter(
    prefix="/api/deposits",
    tags=["Deposits"]
)


# =========================================================
# CREATE DEPOSIT REQUEST
# =========================================================

@router.post("/")
def create_deposit_request(
    deposit_data: DepositCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = create_deposit(
        db=db,
        user_id=current_user.id,
        amount=deposit_data.amount,
        payment_method=deposit_data.payment_method
    )

    return {
        "message": "Deposit request submitted successfully",
        "deposit_id": result["deposit"].id,
        "amount": result["deposit"].amount,
        "payment_method": result["deposit"].payment_method,
        "status": result["deposit"].status,
        "is_first_deposit": result["is_first_deposit"],
        "referral_bonus": result["referral_bonus"]
    }