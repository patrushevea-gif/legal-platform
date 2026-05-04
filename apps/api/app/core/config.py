from functools import lru_cache
from os import getenv


class Settings:
    app_env: str = getenv("APP_ENV", "development")
    database_url: str = getenv("DATABASE_URL", "sqlite:///./legal_platform.db")
    jwt_secret: str = getenv("JWT_SECRET", "change-me-in-production")
    jwt_expiration_minutes: int = int(getenv("JWT_EXPIRATION_MINUTES", "480"))
    enable_demo_seed: bool = getenv(
        "ENABLE_DEMO_SEED",
        "true" if getenv("APP_ENV", "development") != "production" else "false",
    ).lower() in {"1", "true", "yes"}
    cors_allowed_origins: list[str] = [
        origin.strip()
        for origin in getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]

    def __init__(self) -> None:
        if self.app_env == "production" and not getenv("DATABASE_URL"):
            raise ValueError("DATABASE_URL is required when APP_ENV=production")


@lru_cache
def get_settings() -> Settings:
    return Settings()
