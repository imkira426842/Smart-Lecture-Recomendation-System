"""Analytics router: progress stats, subject completion, activity log."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Subject, Unit, Topic, QuizResult, PlannerTask
from deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/progress")
async def get_progress(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Topic)
        .join(Unit)
        .join(Subject)
        .where(Subject.user_id == user.id)
    )
    topics = result.scalars().all()
    total = len(topics)
    completed = sum(1 for t in topics if t.status == "completed")
    in_progress = sum(1 for t in topics if t.status == "in-progress")
    pct = round((completed / total) * 100) if total else 0

    return {
        "overall_progress": pct,
        "total_topics": total,
        "completed": completed,
        "in_progress": in_progress,
        "not_started": total - completed - in_progress,
    }


@router.get("/subjects")
async def get_subject_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subject)
        .where(Subject.user_id == user.id)
    )
    subjects = result.scalars().all()

    stats = []
    for s in subjects:
        res2 = await db.execute(
            select(Topic).join(Unit).where(Unit.subject_id == s.id)
        )
        topics = res2.scalars().all()
        total = len(topics)
        completed = sum(1 for t in topics if t.status == "completed")
        stats.append({
            "subject": s.name,
            "code": s.code,
            "completed": completed,
            "total": total,
            "percent": round((completed / total) * 100) if total else 0,
        })

    return {"subjects": stats}


@router.get("/activity")
async def get_activity_log(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return quiz history as activity log."""
    result = await db.execute(
        select(QuizResult)
        .where(QuizResult.user_id == user.id)
        .order_by(QuizResult.taken_at.desc())
        .limit(20)
    )
    quizzes = result.scalars().all()
    activity = [
        {
            "type": q.quiz_type,
            "title": q.title,
            "score": q.score,
            "total": q.total,
            "taken_at": q.taken_at.isoformat(),
        }
        for q in quizzes
    ]
    return {"activity": activity}


@router.get("/weak-topics")
async def get_weak_topics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return topics that are not-started or in-progress (potential weak areas)."""
    result = await db.execute(
        select(Topic, Unit, Subject)
        .join(Unit)
        .join(Subject)
        .where(
            Subject.user_id == user.id,
            Topic.status.in_(["not-started", "in-progress"]),
        )
        .limit(10)
    )
    rows = result.all()
    weak = [
        {
            "topic": row.Topic.name,
            "unit": row.Unit.name,
            "subject": row.Subject.name,
            "status": row.Topic.status,
        }
        for row in rows
    ]
    return {"weak_topics": weak}
