"""Auth router: register, login, logout, me."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User
from deps import get_current_user
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    id: str
    name: str
    email: str
    degree: str | None = None
    branch: str | None = None
    year: str | None = None
    language: str = "English"
    onboarded: bool = False
    token: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check for existing user
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.flush()  # populate user.id
    token = create_access_token(user.id)
    return AuthResponse(
        id=user.id, name=user.name, email=user.email,
        language=user.language, onboarded=user.onboarded, token=token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return AuthResponse(
        id=user.id, name=user.name, email=user.email,
        degree=user.degree, branch=user.branch, year=user.year,
        language=user.language, onboarded=user.onboarded, token=token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(_: User = Depends(get_current_user)):
    # JWT is stateless; client discards token
    pass


@router.get("/me", response_model=AuthResponse)
async def me(user: User = Depends(get_current_user)):
    return AuthResponse(
        id=user.id, name=user.name, email=user.email,
        degree=user.degree, branch=user.branch, year=user.year,
        language=user.language, onboarded=user.onboarded, token="",
    )
