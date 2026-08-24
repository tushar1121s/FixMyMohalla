from dotenv import load_dotenv
import os

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
OVERDUE_DAYS = int(os.getenv("OVERDUE_DAYS", 7))

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "FixMyMohalla")

NOTIFY_ADMIN_EMAIL = os.getenv("NOTIFY_ADMIN_EMAIL")

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://fix-my-mohalla.vercel.app")