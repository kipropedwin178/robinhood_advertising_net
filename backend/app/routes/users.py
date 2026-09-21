from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.cloudinary_service import upload_profile_photo


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.post(
    "/upload-photo",
    response_model=UserResponse
)
def upload_my_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload or replace the authenticated user's profile photo.
    """

    # -----------------------------------------------------
    # Validate file type
    # -----------------------------------------------------

    allowed_content_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid image format. "
                "Only JPG, PNG, and WEBP images are allowed."
            ),
        )

    # -----------------------------------------------------
    # Validate file size
    # Maximum: 5 MB
    # -----------------------------------------------------

    max_file_size = 5 * 1024 * 1024

    file_contents = file.file.read()

    if len(file_contents) > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile photo must not exceed 5 MB.",
        )

    # -----------------------------------------------------
    # Upload to Cloudinary
    # -----------------------------------------------------

    try:
        photo_url = upload_profile_photo(file_contents)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile photo.",
        )

    # -----------------------------------------------------
    # Save Cloudinary URL
    # -----------------------------------------------------

    current_user.profile_photo_url = photo_url

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user