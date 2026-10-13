"""
YouTube transcript fetcher and lecture recommendation service.
"""
import hashlib
import re
import httpx
from config import get_settings

settings = get_settings()


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|/v/|youtu\.be/|/embed/)([a-zA-Z0-9_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


async def fetch_transcript(url: str) -> str | None:
    """
    Fetch transcript for a YouTube video.
    Returns transcript text or None if unavailable.
    """
    video_id = extract_video_id(url)
    if not video_id:
        return None

    try:
        from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "hi", "en-IN"])
        return " ".join(entry["text"] for entry in transcript_list)
    except Exception:
        return None


async def fetch_video_metadata(video_id: str) -> dict | None:
    """Fetch basic video metadata via YouTube Data API if key is configured."""
    if not settings.YOUTUBE_API_KEY:
        return None
    url = (
        f"https://www.googleapis.com/youtube/v3/videos"
        f"?id={video_id}&part=snippet,contentDetails&key={settings.YOUTUBE_API_KEY}"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                if items:
                    snippet = items[0]["snippet"]
                    return {
                        "title": snippet.get("title"),
                        "channel": snippet.get("channelTitle"),
                        "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                        "description": snippet.get("description", "")[:500],
                    }
    except Exception:
        pass
    return None


def build_search_query(topic: str, subject: str | None, language: str = "English") -> str:
    """Build a YouTube search query for a topic."""
    lang = "" if language == "English" else f"{language} explanation"
    subj = f" {subject}" if subject else ""
    return f"{topic}{subj} tutorial lecture {lang}".strip()


CURATED_CHANNELS = {
    # CS / Engineering
    "Abdul Bari": "UCJjC1hn78yZqTf0vPt8oHFg",
    "freeCodeCamp.org": "UC8butISFwT-Wl7EV0hUK0BQ",
    "MIT OpenCourseWare": "UCEBb1b_L6zDS3xTUrIALZOw",
    "Gate Smashers": "UCJihyK0A38SZ6SdJirEdIOw",
    "Neso Academy": "UCQYMhombleyx7fR9cIBHMlQ",
    "Jenny's Lectures": "UCM4x6XVFE-JxMN5JfzFQ5bA",
    "CS Dojo": "UCxX9wt5FWQUAAz4UrysqK9A",
    "CodeWithHarry": "UCeVMnSShP_Iviwkknt83cww",
}


def get_demo_recommendations(topics: list[str], language: str = "English") -> list[dict]:
    """
    Return curated demo recommendations when no YouTube API key is present.
    These are real, verified public YouTube lectures.
    """
    recs = [
        {
            "id": "l-dsa-1",
            "title": "Data Structures and Algorithms — Full Course",
            "channel": "freeCodeCamp.org",
            "duration": "5h 22m",
            "language": "English",
            "difficulty": "Beginner",
            "topic": "Data Structures",
            "subject": "Data Structures & Algorithms",
            "reason": "Highly rated complete DSA course",
            "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
            "thumbnail": None,
            "isBookmarked": False,
            "isWatched": False,
        },
        {
            "id": "l-os-1",
            "title": "Operating System — Complete Playlist",
            "channel": "Gate Smashers",
            "duration": "12h+",
            "language": "Hindi",
            "difficulty": "Intermediate",
            "topic": "Operating Systems",
            "subject": "Operating Systems",
            "reason": "Popular OS series for GATE & university exams",
            "url": "https://www.youtube.com/watch?v=bkSWJJZNgf8",
            "thumbnail": None,
            "isBookmarked": False,
            "isWatched": False,
        },
        {
            "id": "l-dbms-1",
            "title": "DBMS — Full Course",
            "channel": "Neso Academy",
            "duration": "10h+",
            "language": "English",
            "difficulty": "Beginner",
            "topic": "Database Management",
            "subject": "DBMS",
            "reason": "Clear and structured DBMS lectures",
            "url": "https://www.youtube.com/watch?v=6Iu45VZGQDk",
            "thumbnail": None,
            "isBookmarked": False,
            "isWatched": False,
        },
        {
            "id": "l-cn-1",
            "title": "Computer Networks — Full Course",
            "channel": "Gate Smashers",
            "duration": "8h+",
            "language": "Hindi",
            "difficulty": "Intermediate",
            "topic": "Computer Networks",
            "subject": "Computer Networks",
            "reason": "Widely recommended CN series",
            "url": "https://www.youtube.com/watch?v=JFF2vAaN6Uc",
            "thumbnail": None,
            "isBookmarked": False,
            "isWatched": False,
        },
        {
            "id": "l-algo-1",
            "title": "Algorithms — Abdul Bari Full Course",
            "channel": "Abdul Bari",
            "duration": "13h+",
            "language": "English",
            "difficulty": "Intermediate",
            "topic": "Algorithms",
            "subject": "Design and Analysis of Algorithms",
            "reason": "Best-rated algorithms course on YouTube",
            "url": "https://www.youtube.com/watch?v=0IAPZzGSbME",
            "thumbnail": None,
            "isBookmarked": False,
            "isWatched": False,
        },
    ]
    return recs
