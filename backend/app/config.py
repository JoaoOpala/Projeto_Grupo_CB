"""
Marketplace CB - Application Configuration
Configurações centralizadas via variáveis de ambiente com Pydantic Settings.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações globais da aplicação."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "Marketplace CB"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./marketplace_cb.db"
    )
    DB_ECHO: bool = True
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    @property
    def async_database_url(self) -> str:
        """Converte DATABASE_URL para o driver assíncrono correto."""
        url = self.DATABASE_URL
        # Railway/Heroku fornecem postgresql:// — converter para asyncpg
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    # ── Redis (opcional em dev) ──────────────────────────
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # ── Auth / JWT ───────────────────────────────────────
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Celery (opcional em dev) ─────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in self.DATABASE_URL

    @property
    def database_url_sync(self) -> str:
        return self.DATABASE_URL.replace("+aiosqlite", "").replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
