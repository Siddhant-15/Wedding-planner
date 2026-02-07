# app/core/config.py
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ─── General Application ───────────────────────────────────────────────
    PROJECT_NAME: str = "Mangalam Project"
    API_V1_STR: str = "/api/v1"

    # Environment control
    ENVIRONMENT: str = "development"           # production / staging / development
    DEBUG: bool = True                         # only True in dev

    # ─── Security & JWT ────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15      # shorter is safer (15–30 min common)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14        # 7–30 days common

    # Optional: if you want to rotate refresh tokens
    REFRESH_TOKEN_ROTATION: bool = True

    # ─── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str                           # sync (psycopg2) – for alembic, etc.
    ASYNC_DATABASE_URL: str                     # async (asyncpg) – for FastAPI runtime

    SQL_ECHO: bool = False                      # logs all SQL queries (dev only)

    # ─── Supabase / Storage ────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str = "wedding-assets"     # default bucket name

    # ─── Google OAuth (optional – for social login) ────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""              # add if using Google login

    # ─── CORS (frontend domains) ───────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # "https://your-production-frontend.com",
    ]

    # ─── Pydantic / env loading config ─────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",                         # ignore unknown env vars
        env_nested_delimiter="__",              # optional: for nested vars
    )

    # Optional: post-validation checks
    def model_post_init(self, __context) -> None:
        if not self.JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY is required but not set in .env")
        if not self.JWT_REFRESH_SECRET_KEY:
            raise ValueError("JWT_REFRESH_SECRET_KEY is required but not set in .env")
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required but not set in .env")
        if not self.ASYNC_DATABASE_URL:
            raise ValueError("ASYNC_DATABASE_URL is required but not set in .env")


# Global singleton instance
settings = Settings()