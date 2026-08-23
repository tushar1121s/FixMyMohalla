import cloudinary
import cloudinary.uploader
import config

cloudinary.config(
    cloud_name=config.CLOUDINARY_CLOUD_NAME,
    api_key=config.CLOUDINARY_API_KEY,
    api_secret=config.CLOUDINARY_API_SECRET,
)


def upload_photo(file):
    result = cloudinary.uploader.upload(file.file)
    return result["secure_url"]