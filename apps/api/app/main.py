from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db import Base, engine, SessionLocal
from app.seed import seed_demo_users

settings = get_settings()

app = FastAPI(
    title="legal-platform-api",
    version="0.1.0",
    description="Foundation API for the corporate LegalOps platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.enable_demo_seed:
        with SessionLocal() as session:
            seed_demo_users(session)


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "service": "legal-platform-api",
        "status": "ok",
        "version": "0.1.0",
    }
