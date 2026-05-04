from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, status

from app.models.schemas import (
    CreateLegalRequestPayload,
    LegalRequestItem,
    LegalRequestListResponse,
)


router = APIRouter()

_REQUESTS: list[LegalRequestItem] = []


@router.get("", response_model=LegalRequestListResponse)
def list_requests() -> LegalRequestListResponse:
    return LegalRequestListResponse(items=_REQUESTS, total=len(_REQUESTS))


@router.post("", response_model=LegalRequestItem, status_code=status.HTTP_201_CREATED)
def create_request(payload: CreateLegalRequestPayload) -> LegalRequestItem:
    item = LegalRequestItem(
        id=str(uuid4()),
        title=payload.title,
        request_type=payload.request_type,
        priority=payload.priority,
        business_unit=payload.business_unit,
        description=payload.description,
        status="new",
        created_at=datetime.now(UTC),
    )
    _REQUESTS.append(item)
    return item
