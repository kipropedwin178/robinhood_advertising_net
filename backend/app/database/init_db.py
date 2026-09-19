from app.database.base import Base

from app.database.connection import engine

from app.models.user import User
from app.models.membership import Membership
from app.models.daily_task import DailyTask
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.deposit import Deposit
from app.models.membership_level import MembershipLevel
from app.models.payment_settings import PaymentSettings
def init_db():
    Base.metadata.create_all(bind=engine)