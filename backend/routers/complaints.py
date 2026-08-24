from datetime import datetime, timezone
from typing import Optional, List


from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Complaint, ComplaintHistory, User
from schemas import ComplaintOut, ComplaintDetailOut, StatusUpdate, PriorityUpdate
from auth import get_current_user, require_admin
from utils.cloudinary_upload import upload_photo
from config import OVERDUE_DAYS
from utils.email_utils import send_complaint_created_email, send_status_update_email, send_admin_notification_email

router = APIRouter()


@router.post("/", response_model=ComplaintOut)
def create_complaint(
    category: str = Form(...),
    description: str = Form(...),
    photo: UploadFile = File(None),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo_url = None
    if photo is not None:
        photo_url = upload_photo(photo)

    complaint = Complaint(
        resident_id=current_user.id,
        category=category,
        description=description,
        photo_url=photo_url,
        current_status="Open",
        priority="Low",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    history = ComplaintHistory(
        complaint_id=complaint.id,
        status="Open",
        note="Complaint raised",
        changed_by=current_user.id,
    )
    db.add(history)
    db.commit()

    background_tasks.add_task(send_complaint_created_email, current_user.email, complaint.category, complaint.id)
    
    # Broadcast notification to all verified admins
    admins = db.query(User).filter(User.role == "admin", User.is_verified == True).all()
    if admins:
        for admin in admins:
            background_tasks.add_task(
                send_admin_notification_email,
                complaint.category,
                complaint.id,
                current_user.email,
                admin.email
            )
    else:
        background_tasks.add_task(
            send_admin_notification_email,
            complaint.category,
            complaint.id,
            current_user.email,
            None
        )

    return complaint


@router.get("/my", response_model=list[ComplaintOut])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = (
        db.query(Complaint)
        .filter(Complaint.resident_id == current_user.id, Complaint.is_archived == False)
        .order_by(desc(Complaint.created_at))
        .all()
    )
    return complaints


@router.get("/{complaint_id}", response_model=ComplaintDetailOut)
def get_complaint_detail(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if complaint.resident_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    history = (
        db.query(ComplaintHistory)
        .filter(ComplaintHistory.complaint_id == complaint_id)
        .order_by(ComplaintHistory.changed_at.asc())
        .all()
    )

    result = ComplaintDetailOut.model_validate(complaint)
    result.history = history
    return result


@router.get("")
def get_all_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    include_archived: bool = Query(False),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    query = db.query(Complaint)

    if not include_archived:
        query = query.filter(Complaint.is_archived == False)
    if category:
        query = query.filter(Complaint.category == category)
    if status:
        query = query.filter(Complaint.current_status == status)
    if date_from:
        query = query.filter(Complaint.created_at >= date_from)
    if date_to:
        query = query.filter(Complaint.created_at <= date_to)

    complaints = query.all()

    now = datetime.now(timezone.utc)
    result = []
    for c in complaints:
        created_at = c.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        is_overdue = (
            c.current_status != "Resolved"
            and (now - created_at).days > OVERDUE_DAYS
        )

        result.append({
            "id": c.id,
            "category": c.category,
            "description": c.description,
            "current_status": c.current_status,
            "priority": c.priority,
            "photo_url": c.photo_url,
            "created_at": c.created_at,
            "resolved_at": c.resolved_at,
            "is_overdue": is_overdue,
            "is_archived": bool(c.is_archived),
        })

    result.sort(key=lambda x: (not x["is_overdue"], -x["created_at"].timestamp()))

    return result


@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    update: StatusUpdate,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if complaint.current_status == "Resolved":
        raise HTTPException(status_code=400, detail="Complaint already resolved, cannot update")

    complaint.current_status = update.status
    if update.status == "Resolved":
        complaint.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(complaint)

    history = ComplaintHistory(
        complaint_id=complaint.id,
        status=update.status,
        note=update.note,
        changed_by=admin_user.id,
    )
    db.add(history)
    db.commit()

    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    if resident:
        background_tasks.add_task(send_status_update_email, resident.email, complaint.category, complaint.id, complaint.current_status)

    return {
        "id": complaint.id,
        "current_status": complaint.current_status,
        "resolved_at": complaint.resolved_at,
    }


@router.patch("/{complaint_id}/priority")
def update_complaint_priority(
    complaint_id: int,
    update: PriorityUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.priority = update.priority
    db.commit()
    db.refresh(complaint)

    return {
        "id": complaint.id,
        "priority": complaint.priority,
    }


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.is_archived = True
    db.commit()

    return {"message": "Complaint archived successfully", "id": complaint.id}


@router.patch("/{complaint_id}/restore")
def restore_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.is_archived = False
    db.commit()

    return {"message": "Complaint restored successfully", "id": complaint.id}