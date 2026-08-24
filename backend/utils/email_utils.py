import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import config

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = config.BREVO_API_KEY

api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
    sib_api_v3_sdk.ApiClient(configuration)
)


def _send_email(to_email: str, subject: str, html_content: str):
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        sender={"name": config.MAIL_FROM_NAME, "email": config.MAIL_FROM},
        subject=subject,
        html_content=html_content
    )
    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print(f"Brevo email send failed (to={to_email}): {e}")
        raise


async def send_verification_email(email: str, token: str):
    verify_link = f"{config.FRONTEND_URL}/verify/{token}"
    html = f"""
    <p>Welcome to FixMyMohalla!</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="{verify_link}">{verify_link}</a></p>
    <p>This link will expire in 24 hours.</p>
    """
    _send_email(email, "Verify your FixMyMohalla account", html)

async def send_complaint_created_email(email: str, complaint_title: str, complaint_id: int):
    html = f"""
    <p>Hi,</p>
    <p>Your complaint <b>"{complaint_title}"</b> (ID: {complaint_id}) has been received.</p>
    <p>We'll notify you when there's an update.</p>
    """
    _send_email(email, "Complaint Received - FixMyMohalla", html)


async def send_status_update_email(email: str, complaint_title: str, complaint_id: int, new_status: str):
    html = f"""
    <p>Hi,</p>
    <p>Your complaint <b>"{complaint_title}"</b> (ID: {complaint_id}) status has been updated to:</p>
    <p><b>{new_status}</b></p>
    """
    _send_email(email, "Complaint Status Updated - FixMyMohalla", html)


async def send_admin_notification_email(complaint_title: str, complaint_id: int, resident_email: str):
    html = f"""
    <p>New complaint raised:</p>
    <p><b>{complaint_title}</b> (ID: {complaint_id})</p>
    <p>Raised by: {resident_email}</p>
    """
    _send_email(config.NOTIFY_ADMIN_EMAIL, "New Complaint Raised - FixMyMohalla", html)



async def send_password_reset_email(email: str, token: str):
    reset_link = f"{config.FRONTEND_URL}/reset-password/{token}"
    html = f"""
    <p>Hi,</p>
    <p>You requested to reset your password for FixMyMohalla.</p>
    <p>Please click the link below to set a new password:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
    """
    _send_email(email, "Reset your FixMyMohalla password", html)