from fastapi import FastAPI

from app.api.v1.router import api_router


app = FastAPI(
    title="legal-platform-api",
    version="0.1.0",
    description="Foundation API for the corporate LegalOps platform.",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "service": "legal-platform-api",
        "status": "ok",
        "version": "0.1.0",
    }
