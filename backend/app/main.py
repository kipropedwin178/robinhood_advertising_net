from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import FRONTEND_URL
from app.database.init_db import init_db

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.memberships import router as memberships_router
from app.routes.deposits import router as deposits_router
from app.routes.tasks import router as tasks_router
from app.routes.withdrawals import router as withdrawals_router
from app.routes.wallet import router as wallet_router
from app.routes.admin import router as admin_router
from app.routes.admin_membership import (
    router as admin_membership_router
)
from app.routes.referral import router as referral_router
from app.routes.admin_uploads import (
    router as admin_uploads_router
)
from app.routes.transactions import (
    router as transactions_router
)
from app.routes.admin_payment_settings import (
    router as admin_payment_settings_router
)
from app.routes.payment_settings import (
    router as payment_settings_router
)
from app.routes.earnings import (
    router as earnings_router
)


app = FastAPI(
    title="Robinhood Advertising Network API"
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

@app.on_event("startup")
def startup_event():
    init_db()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REGISTER APPLICATION ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(users_router)

app.include_router(memberships_router)

app.include_router(deposits_router)

app.include_router(tasks_router)

app.include_router(withdrawals_router)

app.include_router(wallet_router)

app.include_router(admin_router)

app.include_router(
    admin_membership_router
)

app.include_router(
    referral_router
)

app.include_router(
    admin_uploads_router
)

app.include_router(
    transactions_router
)

app.include_router(
    admin_payment_settings_router
)

app.include_router(
    payment_settings_router
)

app.include_router(
    earnings_router
)


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Robinhood Advertising Network API"
    }