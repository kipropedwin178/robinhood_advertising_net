from pydantic import BaseModel


class AdminDashboardResponse(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int

    total_deposits: int
    total_deposit_amount: float

    today_deposits: float

    pending_withdrawals: int
    total_withdrawals: int
    total_withdrawn_amount: float

    today_withdrawals: float

    active_memberships: int

    total_user_earnings: float