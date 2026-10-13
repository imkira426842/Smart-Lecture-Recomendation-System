"""Syllabus upload, extraction and confirmation router."""
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from database import get_db
from models import User, Syllabus
from deps import get_current_user
from services.pdf_service import extract_text_from_pdf, parse_curriculum
from services.ai_service import parse_syllabus_with_ai
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/syllabus", tags=["syllabus"])

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = settings.MAX_UPLOAD_MB * 1024 * 1024


@router.post("/upload")
async def upload_syllabus(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(400, f"File too large. Maximum size is {settings.MAX_UPLOAD_MB} MB.")

    # Save file
    dest = UPLOAD_DIR / f"{user.id}_{file.filename}"
    with open(dest, "wb") as f:
        f.write(contents)

    # Extract text
    raw_text = extract_text_from_pdf(contents)

    # Use AI parser if Gemini key is set, otherwise fall back to heuristic
    if settings.GEMINI_API_KEY:
        try:
            extracted = await parse_syllabus_with_ai(raw_text)
        except Exception:
            extracted = parse_curriculum(raw_text)
    else:
        extracted = parse_curriculum(raw_text)

    # Upsert syllabus record
    result = await db.execute(select(Syllabus).where(Syllabus.user_id == user.id))
    syllabus = result.scalar_one_or_none()
    if syllabus:
        syllabus.filename = file.filename
        syllabus.file_path = str(dest)
        syllabus.raw_text = raw_text
        syllabus.extracted_data = extracted
        syllabus.confirmed = False
    else:
        syllabus = Syllabus(
            user_id=user.id,
            filename=file.filename,
            file_path=str(dest),
            raw_text=raw_text,
            extracted_data=extracted,
        )
        db.add(syllabus)

    return {
        "message": "Syllabus uploaded and processed successfully.",
        "subjects_count": extracted.get("subjects_count", 0),
        "topics_count": extracted.get("topics_count", 0),
        "extraction": extracted,
    }


@router.get("/extract")
async def get_extracted(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Syllabus).where(Syllabus.user_id == user.id))
    syllabus = result.scalar_one_or_none()
    if not syllabus:
        raise HTTPException(404, "No syllabus found. Please upload one first.")
    return {
        "filename": syllabus.filename,
        "confirmed": syllabus.confirmed,
        "extraction": syllabus.extracted_data,
        "subjects_count": syllabus.extracted_data.get("subjects_count", 0) if syllabus.extracted_data else 0,
        "topics_count": syllabus.extracted_data.get("topics_count", 0) if syllabus.extracted_data else 0,
    }


class ConfirmRequest(BaseModel):
    subjects: list[dict]  # reviewed/edited curriculum data


@router.post("/confirm")
async def confirm_extraction(
    data: ConfirmRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Called when user reviews and confirms extracted curriculum.
    Saves subjects/units/topics into the normalized curriculum tables.
    """
    from models import Subject, Unit, Topic

    # Clear existing curriculum
    result = await db.execute(
        __import__("sqlalchemy", fromlist=["select"]).select(Subject).where(Subject.user_id == user.id)
    )
    for s in result.scalars().all():
        await db.delete(s)
    await db.flush()

    # Insert confirmed data
    for si, subj_data in enumerate(data.subjects):
        subj = Subject(user_id=user.id, name=subj_data["name"], code=subj_data.get("code"), order=si)
        db.add(subj)
        await db.flush()
        for ui, unit_data in enumerate(subj_data.get("units", [])):
            unit = Unit(subject_id=subj.id, name=unit_data["name"], order=ui)
            db.add(unit)
            await db.flush()
            for ti, topic_data in enumerate(unit_data.get("topics", [])):
                topic = Topic(unit_id=unit.id, name=topic_data["name"], status=topic_data.get("status", "not-started"), order=ti)
                db.add(topic)

    # Mark syllabus confirmed
    res2 = await db.execute(select(Syllabus).where(Syllabus.user_id == user.id))
    syllabus = res2.scalar_one_or_none()
    if syllabus:
        syllabus.confirmed = True

    # Mark user as having syllabus
    user.onboarded = True
    db.add(user)

    return {"message": "Curriculum saved successfully."}


@router.delete("")
async def delete_syllabus(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Syllabus).where(Syllabus.user_id == user.id))
    syllabus = result.scalar_one_or_none()
    if syllabus:
        try:
            os.remove(syllabus.file_path)
        except FileNotFoundError:
            pass
        await db.delete(syllabus)
    return {"message": "Syllabus deleted."}
