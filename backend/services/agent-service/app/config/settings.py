import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:
            pass


class Settings(BaseSettings):
    APP_NAME: str = "AlphaQuant Agent Service"
    PORT: int = 8004
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Service Integration URLs (Defaults to localhost for host dev, overridden by docker env vars)
    USER_SERVICE_URL: str = os.getenv("USER_SERVICE_URL", "http://localhost:8000")
    FINANCE_SERVICE_URL: str = os.getenv("FINANCE_SERVICE_URL", "http://localhost:8001")
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8002")

    # Storage & Cache
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/financial_wellness"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # OpenAI / LLM Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")


settings = Settings()
