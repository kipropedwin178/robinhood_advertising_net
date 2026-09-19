import cloudinary
import cloudinary.uploader

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.admin_dependencies import require_admin
from app.core.config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
)
from app.models.user import User


router = APIRouter(
    prefix="/api/edutech/uploads",
    tags=["Admin Uploads"]
)


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)


# =========================================================
# ALLOWED IMAGE TYPES
# =========================================================

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


# =========================================================
# MAXIMUM IMAGE SIZE
# =========================================================

MAX_IMAGE_SIZE = 5 * 1024 * 1024


# =========================================================
# UPLOAD MEMBERSHIP IMAGE
# =========================================================

@router.post("/membership-image")
async def upload_membership_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin)
):
    # -----------------------------------------------------
    # 1. Validate image type
    # -----------------------------------------------------

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid image type. "
                "Only JPG, JPEG, PNG, and WebP images are allowed."
            )
        )

    # -----------------------------------------------------
    # 2. Read image
    # -----------------------------------------------------

    contents = await file.read()

    # -----------------------------------------------------
    # 3. Validate image size
    # -----------------------------------------------------

    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large. Maximum size is 5 MB."
        )

    # -----------------------------------------------------
    # 4. Upload to Cloudinary
    # -----------------------------------------------------

    try:
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="robinhood/membership_images",
            resource_type="image"
        )

    except Exception as error:
        print("Cloudinary upload error:", error)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upload image. Please try again."
        )

    # -----------------------------------------------------
    # 5. Get secure Cloudinary URL
    # -----------------------------------------------------

    secure_url = upload_result.get("secure_url")

    if not secure_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary did not return an image URL."
        )

    # -----------------------------------------------------
    # 6. Return URL to frontend
    # -----------------------------------------------------

    return {
        "message": "Image uploaded successfully",
        "url": secure_url
    }