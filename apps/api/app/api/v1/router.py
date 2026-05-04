from fastapi import APIRouter

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.requests import router as requests_router


api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(requests_router, prefix="/requests", tags=["requests"])
