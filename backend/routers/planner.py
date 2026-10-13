"""Study task CRUD and curriculum-based deadline planning."""
from datetime import date, timedelta
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from deps import get_current_user
from models import User, PlannerTask, Subject, Unit, Topic

router = APIRouter(prefix="/planner", tags=["planner"])


class TaskInput(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    subject: str | None = None
    topic: str | None = None
    due_date: date | None = None
    duration_minutes: int | None = Field(default=None, ge=1, le=1440)
    priority: Literal["low", "medium", "high"] = "medium"
    completed: bool = False


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    subject: str | None = None
    topic: str | None = None
    due_date: date | None = None
    duration_minutes: int | None = Field(default=None, ge=1, le=1440)
    priority: Literal["low", "medium", "high"] | None = None
    completed: bool | None = None


class CrashInput(BaseModel):
    deadline: date
    daily_minutes: int = Field(ge=15, le=720)


def serialize(t):
    return {key: getattr(t, key) for key in
            ("id", "title", "subject", "topic", "due_date", "duration_minutes", "priority", "completed")}


async def owned_task(db, user, task_id):
    task = (await db.execute(select(PlannerTask).where(
        PlannerTask.id == task_id, PlannerTask.user_id == user.id))).scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Study task not found.")
    return task


@router.get("/tasks")
async def list_tasks(completed: bool | None = None, due_date: str | None = None,
                     user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(PlannerTask).where(PlannerTask.user_id == user.id)
    if completed is not None:
        query = query.where(PlannerTask.completed == completed)
    if due_date:
        query = query.where(PlannerTask.due_date == due_date)
    tasks = (await db.execute(query.order_by(PlannerTask.due_date, PlannerTask.created_at.desc()))).scalars().all()
    return {"tasks": [serialize(t) for t in tasks]}


@router.post("/tasks", status_code=201)
async def create_task(data: TaskInput, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    values = data.model_dump()
    values["due_date"] = data.due_date.isoformat() if data.due_date else None
    task = PlannerTask(user_id=user.id, **values)
    db.add(task)
    await db.flush()
    return serialize(task)


@router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: TaskUpdate,
                      user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    task = await owned_task(db, user, task_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is None and key in ("title", "priority", "completed"):
            raise HTTPException(422, f"{key} cannot be empty.")
        setattr(task, key, value.isoformat() if isinstance(value, date) else value)
    await db.flush()
    return serialize(task)


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.delete(await owned_task(db, user, task_id))


@router.post("/crash-plan", status_code=201)
async def crash_plan(data: CrashInput, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    days = (data.deadline - today).days + 1
    if days < 1 or days > 366:
        raise HTTPException(422, "Choose a deadline between today and one year from today.")
    rows = (await db.execute(select(Topic, Subject.name).join(Unit).join(Subject)
                            .where(Subject.user_id == user.id, Topic.status != "completed")
                            .order_by(Subject.order, Unit.order, Topic.order))).all()
    existing = set((await db.execute(select(PlannerTask.topic).where(
        PlannerTask.user_id == user.id, PlannerTask.completed == False))).scalars().all())
    remaining = [(topic, subject) for topic, subject in rows if topic.name not in existing]
    minutes_per_topic = min(30, data.daily_minutes)
    slots_per_day = data.daily_minutes // minutes_per_topic
    tasks = []
    for index, (topic, subject) in enumerate(remaining[:days * slots_per_day]):
        task = PlannerTask(user_id=user.id, title=f"Revise: {topic.name}", topic=topic.name,
                           subject=subject, due_date=(today + timedelta(days=index // slots_per_day)).isoformat(),
                           duration_minutes=minutes_per_topic, priority="high")
        db.add(task)
        tasks.append(task)
    await db.flush()
    return {"tasks": [serialize(t) for t in tasks], "total_topics": len(rows),
            "scheduled_topics": len(tasks), "already_scheduled_topics": len(rows) - len(remaining),
            "unscheduled_topics": max(0, len(remaining) - len(tasks))}
