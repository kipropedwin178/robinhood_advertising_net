from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.earnings import get_lifetime_earnings


router = APIRouter(
    prefix="/api/earnings",
    tags=["Earnings"]
)


@router.get("/lifetime")
def lifetime_earnings(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    return get_lifetime_earnings(
        db=db,
        user_id=current_user.id
    )