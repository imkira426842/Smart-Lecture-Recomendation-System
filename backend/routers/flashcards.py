"""User-owned flashcard sets and review state."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from deps import get_current_user
from models import User, FlashcardSet, Flashcard

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


class CardInput(BaseModel):
    front: str = Field(min_length=1, max_length=10000)
    back: str = Field(min_length=1, max_length=10000)


class SetInput(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    subject: str | None = None
    topic: str | None = None
    cards: list[CardInput] = Field(min_length=1, max_length=100)


class CardUpdate(BaseModel):
    front: str | None = Field(default=None, min_length=1, max_length=10000)
    back: str | None = Field(default=None, min_length=1, max_length=10000)
    known: bool | None = None


def serialize_card(card):
    return {"id": card.id, "front": card.front, "back": card.back, "known": card.known}


def serialize(item):
    return {"id": item.id, "title": item.title, "subject": item.subject,
            "topic": item.topic, "cards": [serialize_card(c) for c in item.cards],
            "created_at": item.created_at.isoformat()}


async def owned_set(db, user, set_id):
    item = (await db.execute(select(FlashcardSet).options(selectinload(FlashcardSet.cards))
                            .where(FlashcardSet.id == set_id, FlashcardSet.user_id == user.id))).scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Flashcard set not found.")
    return item


@router.get("")
async def list_sets(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = (await db.execute(select(FlashcardSet).options(selectinload(FlashcardSet.cards))
                             .where(FlashcardSet.user_id == user.id)
                             .order_by(FlashcardSet.created_at.desc()))).scalars().all()
    return {"sets": [serialize(item) for item in items]}


@router.post("", status_code=201)
async def save_set(data: SetInput, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = FlashcardSet(user_id=user.id, title=data.title, subject=data.subject, topic=data.topic,
                        cards=[Flashcard(**card.model_dump()) for card in data.cards])
    db.add(item)
    await db.flush()
    return serialize(item)


@router.get("/{set_id}")
async def get_set(set_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return serialize(await owned_set(db, user, set_id))


@router.delete("/{set_id}", status_code=204)
async def delete_set(set_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.delete(await owned_set(db, user, set_id))


@router.put("/{set_id}/cards/{card_id}")
async def update_card(set_id: str, card_id: str, data: CardUpdate,
                      user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = await owned_set(db, user, set_id)
    card = next((c for c in item.cards if c.id == card_id), None)
    if not card:
        raise HTTPException(404, "Card not found.")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(card, key, value)
    await db.flush()
    return serialize_card(card)
