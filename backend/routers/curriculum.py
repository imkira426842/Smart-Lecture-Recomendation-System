"""Curriculum router: full tree, topic CRUD."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from database import get_db
from models import User, Subject, Unit, Topic
from deps import get_current_user

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


def serialize_topic(t: Topic) -> dict:
    return {"id": t.id, "name": t.name, "status": t.status, "order": t.order}


def serialize_unit(u: Unit) -> dict:
    return {"id": u.id, "name": u.name, "order": u.order, "topics": [serialize_topic(t) for t in u.topics]}


def serialize_subject(s: Subject) -> dict:
    return {"id": s.id, "name": s.name, "code": s.code, "order": s.order, "units": [serialize_unit(u) for u in s.units]}


@router.get("")
async def get_curriculum(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subject)
        .where(Subject.user_id == user.id)
        .options(selectinload(Subject.units).selectinload(Unit.topics))
        .order_by(Subject.order)
    )
    subjects = result.scalars().all()
    data = [serialize_subject(s) for s in subjects]
    all_topics = [t for s in subjects for u in s.units for t in u.topics]
    return {
        "subjects": data,
        "stats": {
            "subjects": len(data),
            "total_topics": len(all_topics),
            "completed": sum(1 for t in all_topics if t.status == "completed"),
            "in_progress": sum(1 for t in all_topics if t.status == "in-progress"),
        },
    }


class TopicUpdate(BaseModel):
    name: str | None = None
    status: str | None = None  # not-started|in-progress|completed


@router.put("/topics/{topic_id}")
async def update_topic(
    topic_id: str,
    data: TopicUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Topic)
        .join(Unit)
        .join(Subject)
        .where(Topic.id == topic_id, Subject.user_id == user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(404, "Topic not found.")
    if data.name is not None:
        topic.name = data.name.strip()
    if data.status is not None:
        if data.status not in ("not-started", "in-progress", "completed"):
            raise HTTPException(400, "Invalid status value.")
        topic.status = data.status
    db.add(topic)
    return serialize_topic(topic)


class TopicCreate(BaseModel):
    unit_id: str
    name: str
    status: str = "not-started"


@router.post("/topics", status_code=status.HTTP_201_CREATED)
async def add_topic(
    data: TopicCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify unit belongs to user
    result = await db.execute(
        select(Unit).join(Subject).where(Unit.id == data.unit_id, Subject.user_id == user.id)
    )
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(404, "Unit not found.")
    topic = Topic(unit_id=unit.id, name=data.name.strip(), status=data.status)
    db.add(topic)
    await db.flush()
    return serialize_topic(topic)


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Topic).join(Unit).join(Subject)
        .where(Topic.id == topic_id, Subject.user_id == user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(404, "Topic not found.")
    await db.delete(topic)
