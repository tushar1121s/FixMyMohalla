from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Complaint, ComplaintHistory, User
from schemas import ComplaintCreate, ComplaintOut, ComplaintDetailOut
from auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ComplaintOut)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = Complaint(
        resident_id=current_user.id,
        category=payload.category,
        description=payload.description,
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

    return complaint


@router.get("/my", response_model=list[ComplaintOut])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = (
        db.query(Complaint)
        .filter(Complaint.resident_id == current_user.id)
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