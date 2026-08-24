from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---------- User ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    flat_no: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    flat_no: Optional[str] = None
    is_verified: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class RoleUpdate(BaseModel):
    role: str


# ---------- Complaint ----------
class ComplaintCreate(BaseModel):
    category: str
    description: str


class HistoryOut(BaseModel):
    id: int
    status: str
    note: Optional[str] = None
    changed_by: int
    changed_at: datetime

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id: int
    resident_id: int
    category: str
    description: str
    photo_url: Optional[str] = None
    current_status: str
    priority: str
    is_archived: bool = False
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ComplaintDetailOut(ComplaintOut):
    history: List[HistoryOut] = []


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class PriorityUpdate(BaseModel):
    priority: str


# ---------- Notice ----------
class NoticeCreate(BaseModel):
    title: str
    body: str
    is_important: bool = False


class NoticeOut(BaseModel):
    id: int
    title: str
    body: str
    is_important: bool
    posted_by: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Password Recovery ----------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str