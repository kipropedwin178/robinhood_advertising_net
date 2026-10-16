
import os

from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv(
    "APP_NAME",
    "Robinhood Advertising Network API"
)

DATABASE_URL = os.getenv("DATABASE_URL")

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not configured. "
        "Please add SECRET_KEY to your .env file."
    )

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 2880

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# =========================================================
# CLOUDINARY
# =========================================================

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
]):
    raise RuntimeError(
        "Cloudinary is not configured. "
        "Please add CLOUDINARY_CLOUD_NAME, "
        "CLOUDINARY_API_KEY, and "
        "CLOUDINARY_API_SECRET to your .env file."
    )

# =========================================================
# DEPOSIT EMAIL NOTIFICATIONS
# =========================================================

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SMTP_FROM_EMAIL = os.getenv(
    "SMTP_FROM_EMAIL",
    SMTP_USERNAME or ""
)

DEPOSIT_NOTIFICATION_EMAIL = os.getenv(
    "DEPOSIT_NOTIFICATION_EMAIL",
    "surambaya58@gmail.com"
)