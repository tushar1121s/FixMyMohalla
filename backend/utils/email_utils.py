import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import config

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = config.BREVO_API_KEY

api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
    sib_api_v3_sdk.ApiClient(configuration)
)


async def send_verification_email(email: str, token: str):
    verify_link = f"https://fix-my-mohalla.vercel.app/verify/{token}"

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": config.MAIL_FROM_NAME, "email": config.MAIL_FROM},
        subject="Verify your FixMyMohalla account",
        html_content=f"""
        <p>Welcome to FixMyMohalla!</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="{verify_link}">{verify_link}</a></p>
        <p>This link will expire in 24 hours.</p>
        """
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print(f"Brevo email send failed: {e}")
        raise