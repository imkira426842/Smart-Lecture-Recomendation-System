"""
PDF extraction service using PyMuPDF.
Extracts text from uploaded syllabus PDFs and attempts to parse
subjects, units, and topics using heuristics.
"""
import re
import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n".join(pages)


def parse_curriculum(raw_text: str) -> dict:
    """
    Heuristic parser: tries to identify subjects, units, and topics
    from raw PDF text. Returns a structured dict.

    This is a best-effort parser. For best results the Gemini AI
    service can be used to do a smarter parse (see ai_service.py).
    """
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    subjects = []
    current_subject = None
    current_unit = None

    # Patterns
    subject_pat = re.compile(
        r'^(?:subject|course|paper|module)[\s:\-]+(.+)$', re.IGNORECASE
    )
    unit_pat = re.compile(
        r'^(?:unit|chapter|section|module)[\s\-]?(\d+)[\s:\-]+(.+)$', re.IGNORECASE
    )
    topic_pat = re.compile(r'^\d+[\.\)]\s+(.+)$')
    numbered_pat = re.compile(r'^[\u2022\-\*]\s+(.+)$')

    def new_subject(name: str) -> dict:
        return {"name": name, "code": None, "units": []}

    def new_unit(name: str) -> dict:
        return {"name": name, "topics": []}

    for line in lines:
        if len(line) < 3 or len(line) > 200:
            continue

        sm = subject_pat.match(line)
        if sm:
            current_subject = new_subject(sm.group(1).strip())
            subjects.append(current_subject)
            current_unit = None
            continue

        um = unit_pat.match(line)
        if um:
            unit_name = f"Unit {um.group(1)}: {um.group(2).strip()}"
            current_unit = new_unit(unit_name)
            if current_subject is None:
                current_subject = new_subject("General")
                subjects.append(current_subject)
            current_subject["units"].append(current_unit)
            continue

        tm = topic_pat.match(line) or numbered_pat.match(line)
        if tm:
            topic_name = tm.group(1).strip()
            if current_unit is None:
                if current_subject is None:
                    current_subject = new_subject("General")
                    subjects.append(current_subject)
                current_unit = new_unit("Topics")
                current_subject["units"].append(current_unit)
            current_unit["topics"].append({"name": topic_name, "status": "not-started"})

    # Fallback: if nothing parsed, create one subject with raw lines as topics
    if not subjects:
        topics = [{"name": l, "status": "not-started"} for l in lines[:40] if len(l) > 5]
        subjects = [{"name": "Extracted Content", "code": None, "units": [{"name": "Topics", "topics": topics}]}]

    # Stats
    total_topics = sum(len(u["topics"]) for s in subjects for u in s["units"])
    return {
        "subjects": subjects,
        "subjects_count": len(subjects),
        "topics_count": total_topics,
        "raw_lines": len(lines),
    }
