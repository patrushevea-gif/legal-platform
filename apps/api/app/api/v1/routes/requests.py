from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DatabaseSession, require_roles
from app.entities.models import User, UserRole
from app.models.schemas import (
    CreateLegalRequestPayload,
    LegalRequestItem,
    LegalRequestListResponse,
)
from app.repositories.request_repository import LegalRequestRepository


router = APIRouter()


@router.get("", response_model=LegalRequestListResponse)
def list_requests(
    session: DatabaseSession,
    current_user: Annotated[
        User,
        Depends(
            require_roles(
                UserRole.BUSINESS_REQUESTER,
                UserRole.LEGAL_COUNSEL,
                UserRole.SENIOR_LEGAL_COUNSEL,
                UserRole.CLO,
                UserRole.SYSTEM_ADMIN,
                UserRole.AUDITOR,
            )
        ),
    ],
) -> LegalRequestListResponse:
    items = LegalRequestRepository(session).list_visible_requests(current_user)
    return LegalRequestListResponse(
        items=[
            LegalRequestItem.model_validate(item, from_attributes=True) for item in items
        ],
        total=len(items),
    )


@router.post("", response_model=LegalRequestItem, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: CreateLegalRequestPayload,
    session: DatabaseSession,
    current_user: Annotated[
        User,
        Depends(
            require_roles(
                UserRole.BUSINESS_REQUESTER,
                UserRole.SYSTEM_ADMIN,
            )
        ),
    ],
) -> LegalRequestItem:
    item = LegalRequestRepository(session).create_request(
        payload=payload,
        created_by=current_user,
    )
    return LegalRequestItem.model_validate(item, from_attributes=True)
