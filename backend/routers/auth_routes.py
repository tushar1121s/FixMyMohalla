from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from utils.email_utils import send_verification_email, send_password_reset_email

from database import get_db
import models, schemas, auth
from utils.email_utils import send_verification_email

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        flat_no=user.flat_no,
        role="resident",  # default; admin banayenge manually DB se
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verification_token = auth.create_verification_token(new_user.email)
    background_tasks.add_task(send_verification_email, new_user.email, verification_token)

    return new_user


@router.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    email = auth.verify_verification_token(token)
    if email is None:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return {"message": "Email already verified"}

    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user:
        reset_token = auth.create_password_reset_token(user.email)
        background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    
    # Security best practice: Always return generic message whether email exists or not
    return {"message": "If this email is registered, password reset instructions have been sent."}
@router.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email = auth.verify_password_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = auth.hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now sign in."}


