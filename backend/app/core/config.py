"""
Application Configuration
Loads environment variables and provides configuration settings
"""

from typing import List, Optional
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # App Configuration
    APP_ENV: str = Field(default="development", alias="APP_ENV")
    APP_NAME: str = Field(default="AI Fruit Identification Assistant", alias="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", alias="APP_VERSION")
    DEBUG: bool = Field(default=True, alias="DEBUG")
    SECRET_KEY: str = Field(default="your-super-secret-key-change-in-production", alias="SECRET_KEY")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", alias="HOST")
    PORT: int = Field(default=8000, alias="PORT")
    API_PREFIX: str = Field(default="/api/v1", alias="API_PREFIX")
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        alias="ALLOWED_ORIGINS"
    )
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost:5432/fruit_ai_db",
        alias="DATABASE_URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=20, alias="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=40, alias="DATABASE_MAX_OVERFLOW")
    
    # Redis Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, alias="REDIS_PASSWORD")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = Field(
        default="your-jwt-secret-key-change-in-production",
        alias="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
    # File Upload Configuration
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, alias="MAX_UPLOAD_SIZE_MB")
    ALLOWED_IMAGE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/jpg", "image/png", "image/webp"],
        alias="ALLOWED_IMAGE_TYPES"
    )
    UPLOAD_DIR: str = Field(default="./static/uploads", alias="UPLOAD_DIR")
    TEMP_DIR: str = Field(default="./static/temp", alias="TEMP_DIR")
    EXPORT_DIR: str = Field(default="./static/exports", alias="EXPORT_DIR")
    
    # ML Model Configuration
    ML_MODEL_PATH: str = Field(
        default="./app/ml/models/fruit_classifier.h5",
        alias="ML_MODEL_PATH"
    )
    ML_MODEL_VERSION: str = Field(default="2.3", alias="ML_MODEL_VERSION")
    ML_CONFIDENCE_THRESHOLD: float = Field(default=0.6, alias="ML_CONFIDENCE_THRESHOLD")
    ML_BATCH_SIZE: int = Field(default=32, alias="ML_BATCH_SIZE")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0", alias="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0", alias="CELERY_RESULT_BACKEND")
    
    # Email Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, alias="SMTP_PORT")
    SMTP_USER: str = Field(default="", alias="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", alias="SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = Field(default="noreply@fruitai.com", alias="SMTP_FROM_EMAIL")
    SMTP_FROM_NAME: str = Field(default="Fruit AI Assistant", alias="SMTP_FROM_NAME")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, alias="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS: int = Field(default=100, alias="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, alias="RATE_LIMIT_PERIOD")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", alias="LOG_LEVEL")
    LOG_FILE: str = Field(default="./logs/app.log", alias="LOG_FILE")
    
    # Development
    MOCK_ML_MODEL: bool = Field(default=False, alias="MOCK_ML_MODEL")
    DEMO_MODE: bool = Field(default=False, alias="DEMO_MODE")
    SEED_DATABASE: bool = Field(default=True, alias="SEED_DATABASE")
    GEMINI_API_KEY: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-3.6-flash", alias="GEMINI_MODEL")
    
    model_config = ConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Return allowed origins as list"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS
    
    @property
    def database_url_async(self) -> str:
        """Return async database URL"""
        return self.DATABASE_URL
    
    @property
    def database_url_sync(self) -> str:
        """Return sync database URL (for alembic)"""
        return self.DATABASE_URL.replace("+asyncpg", "")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()