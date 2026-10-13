"""Persistent quiz/exam attempts and server-side scoring."""
from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from deps import get_current_user
from models import User, QuizAttempt, QuizResult
from services import ai_service

quiz_router = APIRouter(prefix="/quiz", tags=["quiz"])
exam_router = APIRouter(prefix="/exams", tags=["exams"])


class ExamInput(BaseModel):
    topic: str = Field(min_length=1, max_length=500)
    subject: str | None = None
    count: int = Field(default=10, ge=1, le=30)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    duration_minutes: int = Field(default=30, ge=1, le=180)


class AnswersInput(BaseModel):
    answers: list[int | None] = Field(max_length=30)


async def create_attempt(db, user, questions, topic, subject, kind="quiz", duration_seconds=1800):
    if not questions:
        raise HTTPException(502, "The AI returned no questions. Please try again.")
    for question in questions:
        options = question.get("options", [])
        correct = question.get("correct")
        if not question.get("text") or not isinstance(options, list) or len(options) < 2 \
                or type(correct) is not int or not 0 <= correct < len(options):
            raise HTTPException(502, "The AI returned an invalid question set. Please try again.")
    attempt = QuizAttempt(user_id=user.id, quiz_type=kind, title=f"{topic} {'exam' if kind == 'exam' else 'quiz'}",
                          topic=topic, subject=subject, questions=questions, duration_seconds=duration_seconds)
    db.add(attempt)
    await db.flush()
    return {"id": attempt.id, "title": attempt.title, "topic": topic, "count": len(questions),
            "questions": [{"text": q["text"], "options": q["options"]} for q in questions],
            "duration_seconds": duration_seconds, "started_at": attempt.started_at.isoformat()}


def serialize_result(r, details=True):
    result = {"id": r.id, "title": r.title, "topic": r.topic, "subject": r.subject,
              "score": r.score, "total": r.total, "percent": round(r.score / r.total * 100) if r.total else 0,
              "submitted": True, "taken_at": r.taken_at.isoformat(), "duration_seconds": r.duration_seconds}
    if details:
        result.update(questions=r.questions, answers=r.answers)
    return result


async def history(db, user, kind):
    results = (await db.execute(select(QuizResult).where(QuizResult.user_id == user.id, QuizResult.quiz_type == kind)
                               .order_by(QuizResult.taken_at.desc()))).scalars().all()
    return {"history": [serialize_result(r, False) for r in results]}


async def get_result(db, user, attempt_id, kind):
    result = (await db.execute(select(QuizResult).where(
        QuizResult.id == attempt_id, QuizResult.user_id == user.id, QuizResult.quiz_type == kind))).scalar_one_or_none()
    if not result:
        raise HTTPException(404, "Result not found. Submit the assessment first.")
    return result


async def submit(db, user, attempt_id, data, kind):
    attempt = (await db.execute(select(QuizAttempt).where(
        QuizAttempt.id == attempt_id, QuizAttempt.user_id == user.id, QuizAttempt.quiz_type == kind)
        .with_for_update())).scalar_one_or_none()
    if not attempt:
        raise HTTPException(404, "Assessment not found.")
    if attempt.submitted:
        return serialize_result(await get_result(db, user, attempt_id, kind))
    if len(data.answers) != len(attempt.questions):
        raise HTTPException(422, "Provide one answer per question; use null for unanswered questions.")
    for answer, q in zip(data.answers, attempt.questions):
        if answer is not None and not 0 <= answer < len(q["options"]):
            raise HTTPException(422, "Invalid answer option.")
    started = attempt.started_at.replace(tzinfo=timezone.utc) if not attempt.started_at.tzinfo else attempt.started_at
    elapsed = int((datetime.now(timezone.utc) - started).total_seconds())
    # Grace period permits the browser's automatic timed submission to arrive.
    if kind == "exam" and elapsed > attempt.duration_seconds + 30:
        raise HTTPException(409, "This exam has expired. Start a new exam.")
    score = sum(answer == q["correct"] for answer, q in zip(data.answers, attempt.questions))
    result = QuizResult(id=attempt.id, user_id=user.id, quiz_type=kind, title=attempt.title,
                        topic=attempt.topic, subject=attempt.subject, questions=attempt.questions,
                        answers=data.answers, score=score, total=len(attempt.questions), duration_seconds=elapsed)
    attempt.submitted = True
    db.add(result)
    await db.flush()
    return serialize_result(result)


@quiz_router.get("/history")
async def quiz_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await history(db, user, "quiz")


@quiz_router.post("/{attempt_id}/submit")
async def submit_quiz(attempt_id: str, data: AnswersInput,
                      user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await submit(db, user, attempt_id, data, "quiz")


@quiz_router.get("/{attempt_id}/results")
async def quiz_results(attempt_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return serialize_result(await get_result(db, user, attempt_id, "quiz"))


@exam_router.get("/history")
async def exam_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await history(db, user, "exam")


@exam_router.post("", status_code=201)
async def create_exam(data: ExamInput, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from routers.ai import _ai_error
    try:
        questions = await ai_service.generate_quiz(data.topic, data.subject, data.count, data.difficulty, user.language)
    except Exception as e:
        _ai_error(e)
    return await create_attempt(db, user, questions, data.topic, data.subject, "exam", data.duration_minutes * 60)


@exam_router.post("/{attempt_id}/submit")
async def submit_exam(attempt_id: str, data: AnswersInput,
                      user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await submit(db, user, attempt_id, data, "exam")


@exam_router.get("/{attempt_id}/results")
async def exam_results(attempt_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return serialize_result(await get_result(db, user, attempt_id, "exam"))
