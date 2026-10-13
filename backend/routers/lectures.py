"""Lecture recommendations, search, and bookmarks router."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Subject, Unit, Topic, LectureBookmark
from deps import get_current_user
from services.youtube_service import get_demo_recommendations

router = APIRouter(prefix="/lectures", tags=["lectures"])


def serialize_bookmark(b: LectureBookmark) -> dict:
    return {
        "id": b.lecture_id,
        "title": b.title,
        "channel": b.channel,
        "url": b.url,
        "duration": b.duration,
        "language": b.language,
        "difficulty": b.difficulty,
        "topic": b.topic,
        "isBookmarked": True,
        "isWatched": b.is_watched,
    }


@router.get("/recommend")
async def get_recommendations(
    subject: str | None = Query(None),
    topic: str | None = Query(None),
    language: str | None = Query(None),
    difficulty: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return lecture recommendations.
    - If topics are in the curriculum, use those to build queries.
    - Returns real curated lectures (always safe to display).
    - In a production system, this would call YouTube Search API.
    """
    # Get user's curriculum topics for context
    result = await db.execute(
        select(Topic)
        .join(Unit)
        .join(Subject)
        .where(Subject.user_id == user.id)
    )
    topics = result.scalars().all()
    topic_names = [t.name for t in topics]

    recs = get_demo_recommendations(topic_names, language or user.language or "English")

    # Apply filters
    if language:
        recs = [r for r in recs if r["language"].lower() == language.lower()]
    if difficulty:
        recs = [r for r in recs if r["difficulty"].lower() == difficulty.lower()]
    if subject:
        recs = [r for r in recs if subject.lower() in r.get("subject", "").lower()]
    if topic:
        recs = [r for r in recs if topic.lower() in r.get("topic", "").lower()]

    # Mark which are bookmarked
    res2 = await db.execute(select(LectureBookmark).where(LectureBookmark.user_id == user.id))
    bookmarks = {b.lecture_id for b in res2.scalars().all()}
    for r in recs:
        r["isBookmarked"] = r["id"] in bookmarks

    return {"lectures": recs, "total": len(recs)}


@router.get("/search")
async def search_lectures(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
):
    """Search lectures by query string."""
    all_recs = get_demo_recommendations([], user.language or "English")
    q_lower = q.lower()
    results = [
        r for r in all_recs
        if q_lower in r["title"].lower()
        or q_lower in r.get("topic", "").lower()
        or q_lower in r.get("subject", "").lower()
    ]
    return {"lectures": results, "total": len(results)}


@router.post("/{lecture_id}/bookmark")
async def toggle_bookmark(
    lecture_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LectureBookmark).where(
            LectureBookmark.user_id == user.id,
            LectureBookmark.lecture_id == lecture_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        return {"bookmarked": False}
    else:
        # Look up lecture details from demo data
        recs = get_demo_recommendations([])
        rec = next((r for r in recs if r["id"] == lecture_id), None)
        bm = LectureBookmark(
            user_id=user.id,
            lecture_id=lecture_id,
            title=rec["title"] if rec else lecture_id,
            channel=rec.get("channel") if rec else None,
            url=rec["url"] if rec else "",
            duration=rec.get("duration") if rec else None,
            language=rec.get("language") if rec else None,
            difficulty=rec.get("difficulty") if rec else None,
            topic=rec.get("topic") if rec else None,
        )
        db.add(bm)
        return {"bookmarked": True}


@router.post("/{lecture_id}/watched")
async def mark_watched(
    lecture_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LectureBookmark).where(
            LectureBookmark.user_id == user.id,
            LectureBookmark.lecture_id == lecture_id,
        )
    )
    bm = result.scalar_one_or_none()
    if bm:
        bm.is_watched = not bm.is_watched
        db.add(bm)
        return {"watched": bm.is_watched}
    return {"watched": False}
