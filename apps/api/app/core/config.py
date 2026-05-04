from functools import lru_cache
from os import getenv


class Settings:
    app_env: str = getenv("APP_ENV", "development")
    database_url: str = getenv("DATABASE_URL", "sqlite:///./legal_platform.db")
    jwt_secret: str = getenv("JWT_SECRET", "change-me-in-production")
    jwt_expiration_minutes: int = int(getenv("JWT_EXPIRATION_MINUTES", "480"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
