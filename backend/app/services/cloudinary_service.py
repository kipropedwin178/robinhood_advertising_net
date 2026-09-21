import cloudinary
import cloudinary.uploader

from app.core.config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME
)


cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)


def upload_profile_photo(file) -> str:
    """
    Upload user profile photo to Cloudinary.
    Returns the secure URL.
    """

    result = cloudinary.uploader.upload(
        file,
        folder="robinhood/profile_photos",
        resource_type="image"
    )

    return result["secure_url"]