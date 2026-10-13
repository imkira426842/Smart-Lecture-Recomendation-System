"""
Google Gemini AI service wrapper.
All AI features route through here so the API key is managed centrally.
If no key is configured, raises a clear error (frontend shows it honestly).
"""
import json
import re
from config import get_settings

settings = get_settings()

_model = None


def _get_model():
    global _model
    if _model is not None:
        return _model
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured. Add it to your .env file.")
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


def _extract_json(text: str) -> str:
    """Strip markdown code fences if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    if match:
        return match.group(1).strip()
    return text


async def chat_with_ai(messages: list[dict], context: dict | None = None, language: str = "English") -> str:
    """
    Multi-turn chat for the AI Study Assistant.
    messages: [{"role": "user"|"assistant", "content": "..."}]
    context: optional {"subject": ..., "topic": ...}
    """
    model = _get_model()

    system = (
        f"You are LearnPilot AI, a friendly and knowledgeable study assistant for college students. "
        f"Respond in {language}. "
        f"Format your answers clearly using markdown. "
        f"When explaining code, use fenced code blocks with the correct language tag. "
        f"Be concise, accurate, and helpful. "
    )
    if context:
        if context.get("subject"):
            system += f"The student is studying: {context['subject']}. "
        if context.get("topic"):
            system += f"Current topic: {context['topic']}. "

    # Build prompt from history
    history_text = ""
    for m in messages[:-1]:
        role = "Student" if m["role"] == "user" else "LearnPilot AI"
        history_text += f"{role}: {m['content']}\n\n"

    last_message = messages[-1]["content"] if messages else ""
    prompt = f"{system}\n\n{history_text}Student: {last_message}\n\nLearnPilot AI:"

    response = model.generate_content(prompt)
    return response.text


async def summarize_content(text: str, length: str = "medium", language: str = "English") -> dict:
    """
    Summarize lecture text/transcript.
    Returns: {summary, key_concepts, definitions, revision_points}
    """
    model = _get_model()
    length_map = {"short": "3-5 bullet points", "medium": "8-12 bullet points", "long": "comprehensive"}
    detail = length_map.get(length, "8-12 bullet points")

    prompt = f"""Analyze the following lecture content and provide a structured summary in {language}.
Return ONLY valid JSON in this exact format:
{{
  "summary": "2-3 sentence overview",
  "key_concepts": ["concept 1", "concept 2", "..."],
  "definitions": [{{"term": "...", "definition": "..."}}],
  "revision_points": ["point 1", "point 2", "..."]
}}

The revision_points should be {detail}.

LECTURE CONTENT:
{text[:8000]}
"""
    response = model.generate_content(prompt)
    try:
        return json.loads(_extract_json(response.text))
    except json.JSONDecodeError:
        return {
            "summary": response.text[:500],
            "key_concepts": [],
            "definitions": [],
            "revision_points": [],
        }


async def generate_notes(topic: str, subject: str | None, language: str = "English") -> str:
    """Generate structured markdown notes for a topic."""
    model = _get_model()
    subject_ctx = f" in {subject}" if subject else ""
    prompt = f"""Create comprehensive study notes for the topic "{topic}"{subject_ctx}.
Write in {language}. Format as markdown with clear sections:
- Definition and overview
- Key concepts (with explanations)
- Important formulas or rules (if applicable)
- Real-world examples
- Common exam questions / things to remember

Make the notes revision-friendly, accurate, and well-structured."""
    response = model.generate_content(prompt)
    return response.text


async def generate_flashcards(topic: str, subject: str | None, count: int = 10, language: str = "English") -> list[dict]:
    """Generate flashcard Q&A pairs for a topic."""
    model = _get_model()
    subject_ctx = f" in {subject}" if subject else ""
    prompt = f"""Generate {count} flashcards for the topic "{topic}"{subject_ctx} in {language}.
Return ONLY valid JSON array:
[
  {{"front": "Question or term", "back": "Answer or definition"}},
  ...
]
Make the flashcards diverse: include definitions, concepts, examples, and application questions."""
    response = model.generate_content(prompt)
    try:
        return json.loads(_extract_json(response.text))
    except json.JSONDecodeError:
        return []


async def generate_quiz(topic: str, subject: str | None, count: int = 5, difficulty: str = "medium", language: str = "English") -> list[dict]:
    """Generate MCQ quiz questions for a topic."""
    model = _get_model()
    subject_ctx = f" in {subject}" if subject else ""
    prompt = f"""Generate {count} multiple-choice questions for "{topic}"{subject_ctx}.
Difficulty: {difficulty}. Language: {language}.
Return ONLY valid JSON array:
[
  {{
    "text": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why option A is correct."
  }}
]
The "correct" field is the 0-based index of the correct option. Make questions clear and educational."""
    response = model.generate_content(prompt)
    try:
        return json.loads(_extract_json(response.text))
    except json.JSONDecodeError:
        return []


async def parse_syllabus_with_ai(raw_text: str) -> dict:
    """Use Gemini to intelligently parse syllabus PDF text into structured curriculum."""
    model = _get_model()
    prompt = f"""Parse the following syllabus text and extract the curriculum structure.
Return ONLY valid JSON:
{{
  "subjects": [
    {{
      "name": "Subject Name",
      "code": "CODE or null",
      "units": [
        {{
          "name": "Unit Name",
          "topics": [
            {{"name": "Topic Name", "status": "not-started"}}
          ]
        }}
      ]
    }}
  ],
  "subjects_count": 0,
  "topics_count": 0
}}

SYLLABUS TEXT:
{raw_text[:10000]}
"""
    response = model.generate_content(prompt)
    try:
        result = json.loads(_extract_json(response.text))
        # Calculate counts
        subjects = result.get("subjects", [])
        topics = sum(len(u.get("topics", [])) for s in subjects for u in s.get("units", []))
        result["subjects_count"] = len(subjects)
        result["topics_count"] = topics
        return result
    except json.JSONDecodeError:
        # Fall back to heuristic parser
        from services.pdf_service import parse_curriculum
        return parse_curriculum(raw_text)
