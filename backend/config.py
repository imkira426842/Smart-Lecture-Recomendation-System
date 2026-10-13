"""
LearnPilot AI — Application Settings
Reads from .env file via pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # JWT
    JWT_SECRET_KEY: str = Field(validation_alias=AliasChoices("SESSION_SECRET", "JWT_SECRET_KEY"))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./learnpilot.db"

    # AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # YouTube
    YOUTUBE_API_KEY: str = ""

    # CORS
    FRONTEND_URL: str = "http://localhost:5174"

    # File uploads
    MAX_UPLOAD_MB: int = 10
    UPLOAD_DIR: str = "./uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
