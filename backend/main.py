"""
LearnPilot AI — FastAPI Application Entry Point
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db

from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.syllabus import router as syllabus_router
from routers.curriculum import router as curriculum_router
from routers.lectures import router as lectures_router
from routers.notes import router as notes_router
from routers.ai import router as ai_router
from routers.analytics import router as analytics_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Create all DB tables
    await init_db()
    yield


app = FastAPI(
    title="LearnPilot AI API",
    version="1.0.0",
    description="Smart Lecture Recommendation System backend",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(syllabus_router)
app.include_router(curriculum_router)
app.include_router(lectures_router)
app.include_router(notes_router)
app.include_router(ai_router)
app.include_router(analytics_router)

# ── Minimal stub routers for quiz / exam / planner / flashcards ──
# These return empty responses so the frontend doesn't error out.
# Replace with full implementations when ready.
from fastapi import APIRouter
from deps import get_current_user
from models import User

_quiz = APIRouter(prefix="/quiz", tags=["quiz"])
_exam = APIRouter(prefix="/exams", tags=["exams"])
_planner = APIRouter(prefix="/planner", tags=["planner"])
_flashcards_router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@_quiz.get("/history")
async def quiz_history(user: User = get_current_user):
    return {"history": []}

@_exam.get("/history")
async def exam_history(user: User = get_current_user):
    return {"history": []}

@_planner.get("/tasks")
async def planner_tasks(user: User = get_current_user):
    return {"tasks": []}

@_flashcards_router.get("")
async def flashcard_sets(user: User = get_current_user):
    return {"sets": []}

app.include_router(_quiz)
app.include_router(_exam)
app.include_router(_planner)
app.include_router(_flashcards_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "LearnPilot AI"}
