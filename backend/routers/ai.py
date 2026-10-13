"""AI features router: chat, summarize, notes, flashcards, quiz generation."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from models import User
from deps import get_current_user
import services.ai_service as ai_service
import services.youtube_service as yt_service

router = APIRouter(prefix="/ai", tags=["ai"])


def _ai_error(e: Exception):
    msg = str(e)
    if "GEMINI_API_KEY" in msg:
        raise HTTPException(503, "AI service not configured. Set GEMINI_API_KEY in your backend .env file.")
    raise HTTPException(502, f"AI service error: {msg}")


# ── Chat ─────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    messages: list[dict]  # [{"role": "user"|"assistant", "content": "..."}]
    context: dict | None = None  # {"subject": ..., "topic": ...}


@router.post("/chat")
async def chat(data: ChatRequest, user: User = Depends(get_current_user)):
    if not data.messages:
        raise HTTPException(400, "No messages provided.")
    try:
        reply = await ai_service.chat_with_ai(
            data.messages, data.context, user.language or "English"
        )
        return {"reply": reply, "role": "assistant"}
    except Exception as e:
        _ai_error(e)


# ── Summarize ────────────────────────────────────────────────

class SummarizeRequest(BaseModel):
    url: str | None = None
    text: str | None = None
    length: str = "medium"  # short|medium|long
    language: str | None = None


@router.post("/summarize")
async def summarize(data: SummarizeRequest, user: User = Depends(get_current_user)):
    content = data.text or ""
    transcript_fetched = False

    if data.url and not content:
        transcript = await yt_service.fetch_transcript(data.url)
        if transcript:
            content = transcript
            transcript_fetched = True
        else:
            raise HTTPException(
                422,
                "Could not retrieve a transcript for this video. "
                "The video may not have captions, or it may be private/unavailable. "
                "Please paste the transcript text manually.",
            )

    if not content.strip():
        raise HTTPException(400, "Provide either a URL with captions or transcript text.")

    lang = data.language or user.language or "English"
    try:
        result = await ai_service.summarize_content(content, data.length, lang)
        result["transcript_used"] = transcript_fetched
        return result
    except Exception as e:
        _ai_error(e)


# ── Notes ────────────────────────────────────────────────────

class NotesRequest(BaseModel):
    topic: str
    subject: str | None = None
    language: str | None = None


@router.post("/notes/generate")
async def generate_notes(data: NotesRequest, user: User = Depends(get_current_user)):
    lang = data.language or user.language or "English"
    try:
        notes = await ai_service.generate_notes(data.topic, data.subject, lang)
        return {"content": notes, "topic": data.topic, "subject": data.subject}
    except Exception as e:
        _ai_error(e)


# ── Flashcards ───────────────────────────────────────────────

class FlashcardsRequest(BaseModel):
    topic: str
    subject: str | None = None
    count: int = 10
    language: str | None = None


@router.post("/flashcards/generate")
async def generate_flashcards(data: FlashcardsRequest, user: User = Depends(get_current_user)):
    lang = data.language or user.language or "English"
    try:
        cards = await ai_service.generate_flashcards(data.topic, data.subject, min(data.count, 20), lang)
        return {"cards": cards, "count": len(cards), "topic": data.topic}
    except Exception as e:
        _ai_error(e)


# ── Quiz ─────────────────────────────────────────────────────

class QuizRequest(BaseModel):
    topic: str
    subject: str | None = None
    count: int = 5
    difficulty: str = "medium"  # easy|medium|hard
    language: str | None = None


@router.post("/quiz/generate")
async def generate_quiz(data: QuizRequest, user: User = Depends(get_current_user)):
    lang = data.language or user.language or "English"
    try:
        questions = await ai_service.generate_quiz(
            data.topic, data.subject, min(data.count, 15), data.difficulty, lang
        )
        return {"questions": questions, "count": len(questions), "topic": data.topic}
    except Exception as e:
        _ai_error(e)
