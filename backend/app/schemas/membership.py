from datetime import datetime

from pydantic import BaseModel


class MembershipResponse(BaseModel):
    id: int
    user_id: int
    level: int
    name: str
    description: str
    price: float
    released_date: str
    activation_fee: float
    daily_reward: float
    started_at: datetime
    expires_at: datetime
    is_active: bool
    task_completed_today: bool