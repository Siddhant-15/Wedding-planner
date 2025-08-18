# app/config.py
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mangalam Project"
    API_V1_STR: str = "/api/v1"

    # JWT settings
    JWT_SECRET_KEY: str = "your_access_secret_key"  # Change to a strong random value
    JWT_REFRESH_SECRET_KEY: str = "your_refresh_secret_key"  # Change to a strong random value
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://myuser:siddhant@localhost:5432/Mangalam"
    )

    class Config:
        env_file = ".env"  # load from .env file if available

settings = Settings()
