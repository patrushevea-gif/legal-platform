from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.db import Base, engine, SessionLocal
from app.seed import seed_demo_users


app = FastAPI(
    title="legal-platform-api",
    version="0.1.0",
    description="Foundation API for the corporate LegalOps platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_demo_users(session)


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "service": "legal-platform-api",
        "status": "ok",
        "version": "0.1.0",
    }
