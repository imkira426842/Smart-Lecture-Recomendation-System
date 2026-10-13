"""Profile router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from database import get_db
from models import User
from deps import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    degree: str | None = None
    branch: str | None = None
    year: str | None = None
    language: str | None = None
    onboarded: bool | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    degree: str | None = None
    branch: str | None = None
    year: str | None = None
    language: str = "English"
    onboarded: bool = False


@router.get("", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user)):
    return ProfileResponse(
        id=user.id, name=user.name, email=user.email,
        degree=user.degree, branch=user.branch, year=user.year,
        language=user.language, onboarded=user.onboarded,
    )


@router.put("", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.name is not None:
        user.name = data.name.strip()
    if data.degree is not None:
        user.degree = data.degree
    if data.branch is not None:
        user.branch = data.branch
    if data.year is not None:
        user.year = data.year
    if data.language is not None:
        user.language = data.language
    if data.onboarded is not None:
        user.onboarded = data.onboarded
    db.add(user)
    return ProfileResponse(
        id=user.id, name=user.name, email=user.email,
        degree=user.degree, branch=user.branch, year=user.year,
        language=user.language, onboarded=user.onboarded,
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.delete(user)
