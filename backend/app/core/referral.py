from sqlalchemy.orm import Session

from app.models.user import User


STARTING_NUMBER = 2400


def generate_referral_code(db: Session) -> str:
    users = db.query(User.referral_code).all()

    highest_number = STARTING_NUMBER - 1

    for (code,) in users:
        if code and code.startswith("RBH"):
            try:
                number = int(code[3:])
                highest_number = max(highest_number, number)
            except ValueError:
                continue

    return f"RBH{highest_number + 1}"