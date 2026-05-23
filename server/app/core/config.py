# ─────────────────────────────────────────────────────────────────────────────
# app/core/config.py
# Production-ready centralized settings
# ─────────────────────────────────────────────────────────────────────────────

from functools import lru_cache
from typing import List, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ─────────────────────────────────────────────────────────────────────
    # APP
    # ─────────────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "Mangalam Project"

    API_V1_STR: str = "/api/v1"

    ENVIRONMENT: Literal[
        "development",
        "staging",
        "production"
    ] = "development"

    DEBUG: bool = False

    APP_VERSION: str = "2.0.0"

    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # ─────────────────────────────────────────────────────────────────────
    # SECURITY / AUTH
    # ─────────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    REFRESH_TOKEN_ROTATION: bool = True

    PASSWORD_BCRYPT_ROUNDS: int = 12

    # Idempotency
    IDEMPOTENCY_TTL_SECONDS: int = 60 * 60 * 24

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    # ─────────────────────────────────────────────────────────────────────
    # DATABASE
    # ─────────────────────────────────────────────────────────────────────
    DATABASE_URL: str
    ASYNC_DATABASE_URL: str

    SQL_ECHO: bool = False

    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # ─────────────────────────────────────────────────────────────────────
    # REDIS
    # ─────────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─────────────────────────────────────────────────────────────────────
    # STORAGE (DYNAMIC PROVIDER SYSTEM)
    # supabase | s3 | r2 | spaces | minio
    # ─────────────────────────────────────────────────────────────────────
    STORAGE_PROVIDER: Literal[
        "supabase",
        "s3",
        "r2",
        "spaces",
        "minio"
    ] = "supabase"

    STORAGE_BUCKET: str = "wedding-assets"

    CDN_BASE: str = ""

    MEDIA_URL_EXPIRY_SECONDS: int = 3600

    # ─────────────────────────────────────────────────────────────────────
    # SUPABASE
    # ─────────────────────────────────────────────────────────────────────
    SUPABASE_URL: str = ""

    SUPABASE_ANON_KEY: str = ""

    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ─────────────────────────────────────────────────────────────────────
    # S3 / CLOUDFLARE R2 / DIGITALOCEAN SPACES / MINIO
    # ─────────────────────────────────────────────────────────────────────
    S3_ACCESS_KEY: str = ""

    S3_SECRET_KEY: str = ""

    S3_REGION: str = "ap-south-1"

    S3_ENDPOINT_URL: str = ""

    # ─────────────────────────────────────────────────────────────────────
    # CELERY / BACKGROUND JOBS
    # ─────────────────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"

    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ─────────────────────────────────────────────────────────────────────
    # OBSERVABILITY
    # ─────────────────────────────────────────────────────────────────────
    SENTRY_DSN: str = ""

    OTEL_ENDPOINT: str = ""

    ENABLE_TRACING: bool = False

    # ─────────────────────────────────────────────────────────────────────
    # FILE UPLOAD SECURITY LIMITS
    # ─────────────────────────────────────────────────────────────────────
    MAX_IMAGE_MB: int = 15

    MAX_VIDEO_MB: int = 200

    MAX_IMAGES_PER_SERVICE: int = 20

    MAX_VIDEOS_PER_SERVICE: int = 3

    ALLOWED_IMAGE_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    ALLOWED_VIDEO_TYPES: List[str] = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
    ]

    # ─────────────────────────────────────────────────────────────────────
    # CORS
    # ─────────────────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # ─────────────────────────────────────────────────────────────────────
    # ADMIN MODERATION
    # ─────────────────────────────────────────────────────────────────────
    AUTO_APPROVE_SERVICES: bool = False

    SERVICE_REVIEW_REQUIRED: bool = True

    # ─────────────────────────────────────────────────────────────────────
    # SEARCH / CACHE
    # ─────────────────────────────────────────────────────────────────────
    CACHE_TTL_SECONDS: int = 300

    # ─────────────────────────────────────────────────────────────────────
    # GOOGLE OAUTH
    # ─────────────────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""

    GOOGLE_CLIENT_SECRET: str = ""

    # ─────────────────────────────────────────────────────────────────────
    # PYDANTIC CONFIG
    # ─────────────────────────────────────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        env_nested_delimiter="__",
    )

    # ─────────────────────────────────────────────────────────────────────
    # VALIDATORS
    # ─────────────────────────────────────────────────────────────────────
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        """
        Allows:
        CORS_ORIGINS=http://a.com,http://b.com
        """
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # ─────────────────────────────────────────────────────────────────────
    # POST INIT VALIDATION
    # ─────────────────────────────────────────────────────────────────────
    def model_post_init(self, __context):

        required_fields = {
            "JWT_SECRET_KEY": self.JWT_SECRET_KEY,
            "JWT_REFRESH_SECRET_KEY": self.JWT_REFRESH_SECRET_KEY,
            "DATABASE_URL": self.DATABASE_URL,
            "ASYNC_DATABASE_URL": self.ASYNC_DATABASE_URL,
        }

        for field_name, value in required_fields.items():
            if not value:
                raise ValueError(
                    f"{field_name} is required but missing."
                )

        # Validate storage config
        if self.STORAGE_PROVIDER == "supabase":
            if not self.SUPABASE_URL:
                raise ValueError(
                    "SUPABASE_URL is required when using Supabase storage."
                )

            if not self.SUPABASE_SERVICE_ROLE_KEY:
                raise ValueError(
                    "SUPABASE_SERVICE_ROLE_KEY is required when using Supabase storage."
                )

        # Validate S3-like providers
        if self.STORAGE_PROVIDER in {
            "s3",
            "r2",
            "spaces",
            "minio",
        }:
            if not self.S3_ACCESS_KEY:
                raise ValueError(
                    "S3_ACCESS_KEY is required for S3-compatible storage."
                )

            if not self.S3_SECRET_KEY:
                raise ValueError(
                    "S3_SECRET_KEY is required for S3-compatible storage."
                )


# ─────────────────────────────────────────────────────────────────────────────
# Singleton settings instance
# ─────────────────────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()