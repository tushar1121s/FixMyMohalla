from fastapi_mail import FastMail, MessageSchema, MessageType
import config


async def send_verification_email(email: str, token: str):
    verify_link = f"https://fix-my-mohalla.vercel.app/verify/{token}"

    message = MessageSchema(
        subject="Verify your FixMyMohalla account",
        recipients=[email],
        body=f"""
        <p>Welcome to FixMyMohalla!</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="{verify_link}">{verify_link}</a></p>
        <p>This link will expire in 24 hours.</p>
        """,
        subtype=MessageType.html
    )

    fm = FastMail(config.MAIL_CONFIG)
    await fm.send_message(message)