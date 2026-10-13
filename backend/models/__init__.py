"""All SQLAlchemy ORM models in one module for simplicity."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Boolean, Integer, Float, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


# ─────────────────────────── User ────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Profile
    degree: Mapped[str | None] = mapped_column(String(100))
    branch: Mapped[str | None] = mapped_column(String(100))
    year: Mapped[str | None] = mapped_column(String(50))
    language: Mapped[str] = mapped_column(String(50), default="English")
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    syllabus: Mapped["Syllabus | None"] = relationship("Syllabus", back_populates="user", uselist=False)
    subjects: Mapped[list["Subject"]] = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    bookmarks: Mapped[list["LectureBookmark"]] = relationship("LectureBookmark", back_populates="user", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    flashcard_sets: Mapped[list["FlashcardSet"]] = relationship("FlashcardSet", back_populates="user", cascade="all, delete-orphan")
    quiz_results: Mapped[list["QuizResult"]] = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    planner_tasks: Mapped[list["PlannerTask"]] = relationship("PlannerTask", back_populates="user", cascade="all, delete-orphan")


# ─────────────────────────── Syllabus ────────────────────────

class Syllabus(Base):
    __tablename__ = "syllabi"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    raw_text: Mapped[str | None] = mapped_column(Text)
    extracted_data: Mapped[dict | None] = mapped_column(JSON)   # raw extraction result
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="syllabus")


# ─────────────────────────── Curriculum ──────────────────────

class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50))
    order: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship("User", back_populates="subjects")
    units: Mapped[list["Unit"]] = relationship("Unit", back_populates="subject", cascade="all, delete-orphan", order_by="Unit.order")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    subject: Mapped["Subject"] = relationship("Subject", back_populates="units")
    topics: Mapped[list["Topic"]] = relationship("Topic", back_populates="unit", cascade="all, delete-orphan", order_by="Topic.order")


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="not-started")  # not-started|in-progress|completed
    order: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    unit: Mapped["Unit"] = relationship("Unit", back_populates="topics")


# ─────────────────────────── Lectures ────────────────────────

class LectureBookmark(Base):
    __tablename__ = "lecture_bookmarks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    lecture_id: Mapped[str] = mapped_column(String(255), nullable=False)  # YouTube video ID or URL hash
    title: Mapped[str] = mapped_column(String(500))
    channel: Mapped[str | None] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(1000))
    duration: Mapped[str | None] = mapped_column(String(50))
    language: Mapped[str | None] = mapped_column(String(50))
    difficulty: Mapped[str | None] = mapped_column(String(50))
    topic: Mapped[str | None] = mapped_column(String(255))
    is_watched: Mapped[bool] = mapped_column(Boolean, default=False)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="bookmarks")


# ─────────────────────────── Notes ───────────────────────────

class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    subject: Mapped[str | None] = mapped_column(String(255))
    topic: Mapped[str | None] = mapped_column(String(255))
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual|ai-generated
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="notes")


# ─────────────────────────── Flashcards ──────────────────────

class FlashcardSet(Base):
    __tablename__ = "flashcard_sets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255))
    topic: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="flashcard_sets")
    cards: Mapped[list["Flashcard"]] = relationship("Flashcard", back_populates="set", cascade="all, delete-orphan")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    set_id: Mapped[str] = mapped_column(ForeignKey("flashcard_sets.id", ondelete="CASCADE"))
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    known: Mapped[bool] = mapped_column(Boolean, default=False)

    set: Mapped["FlashcardSet"] = relationship("FlashcardSet", back_populates="cards")


# ─────────────────────────── Quiz / Exams ────────────────────

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    quiz_type: Mapped[str] = mapped_column(String(20), default="quiz")  # quiz|exam
    title: Mapped[str] = mapped_column(String(500))
    subject: Mapped[str | None] = mapped_column(String(255))
    topic: Mapped[str | None] = mapped_column(String(255))
    questions: Mapped[list] = mapped_column(JSON)   # list of {text, options, correct, explanation}
    answers: Mapped[list] = mapped_column(JSON)      # user submitted answers
    score: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="quiz_results")


# ─────────────────────────── Planner ─────────────────────────

class PlannerTask(Base):
    __tablename__ = "planner_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255))
    topic: Mapped[str | None] = mapped_column(String(255))
    due_date: Mapped[str | None] = mapped_column(String(20))   # YYYY-MM-DD
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="planner_tasks")
