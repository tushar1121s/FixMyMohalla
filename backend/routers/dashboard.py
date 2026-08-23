from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Complaint, User
from auth import require_admin
from config import OVERDUE_DAYS

router = APIRouter()


@router.get("/")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    status_counts = (
        db.query(Complaint.current_status, func.count(Complaint.id))
        .group_by(Complaint.current_status)
        .all()
    )

    category_counts = (
        db.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )

    now = datetime.now(timezone.utc)
    all_complaints = db.query(Complaint).filter(Complaint.current_status != "Resolved").all()

    overdue_count = 0
    for c in all_complaints:
        created_at = c.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if (now - created_at).days > OVERDUE_DAYS:
            overdue_count += 1

    return {
        "by_status": {status: count for status, count in status_counts},
        "by_category": {category: count for category, count in category_counts},
        "overdue_count": overdue_count,
    }