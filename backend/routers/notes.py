"""Notes CRUD router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from database import get_db
from models import User, Note
from deps import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])


def serialize(n: Note) -> dict:
    return {
        "id": n.id, "title": n.title, "content": n.content,
        "subject": n.subject, "topic": n.topic, "source": n.source,
        "created_at": n.created_at.isoformat(), "updated_at": n.updated_at.isoformat(),
    }


class NoteCreate(BaseModel):
    title: str
    content: str = ""
    subject: str | None = None
    topic: str | None = None
    source: str = "manual"


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    subject: str | None = None
    topic: str | None = None


@router.get("")
async def list_notes(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.user_id == user.id).order_by(Note.updated_at.desc()))
    return {"notes": [serialize(n) for n in result.scalars().all()]}


@router.get("/{note_id}")
async def get_note(note_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == user.id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found.")
    return serialize(note)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_note(data: NoteCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    note = Note(user_id=user.id, **data.model_dump())
    db.add(note)
    await db.flush()
    return serialize(note)


@router.put("/{note_id}")
async def update_note(note_id: str, data: NoteUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == user.id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found.")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(note, k, v)
    db.add(note)
    return serialize(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.id == note_id, Note.user_id == user.id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found.")
    await db.delete(note)
