from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Notice, User
from schemas import NoticeCreate, NoticeOut
from auth import get_current_user, require_admin

router = APIRouter()


@router.post("/", response_model=NoticeOut)
def create_notice(
    notice: NoticeCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    new_notice = Notice(
        title=notice.title,
        body=notice.body,
        is_important=notice.is_important,
        posted_by=admin_user.id,
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return new_notice


@router.get("/", response_model=list[NoticeOut])
def get_all_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notices = (
        db.query(Notice)
        .order_by(desc(Notice.is_important), desc(Notice.created_at))
        .all()
    )
    return notices


@router.delete("/{notice_id}", status_code=status.HTTP_200_OK)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notice not found",
        )
    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully", "id": notice_id}