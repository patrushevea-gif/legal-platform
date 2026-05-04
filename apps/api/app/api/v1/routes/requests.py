from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DatabaseSession, require_roles
from app.entities.models import User, UserRole
from app.models.schemas import (
    AssignLegalRequestPayload,
    CreateLegalRequestPayload,
    LegalRequestItem,
    LegalQueueResponse,
    LegalRequestListResponse,
    UpdateLegalRequestStatusPayload,
)
from app.repositories.request_repository import LegalRequestRepository
from app.repositories.user_repository import UserRepository


router = APIRouter()


def to_legal_request_item(item) -> LegalRequestItem:
    return LegalRequestItem(
        id=item.id,
        title=item.title,
        request_type=item.request_type.value,
        priority=item.priority.value,
        business_unit=item.business_unit,
        description=item.description,
        status=item.status.value,
        created_by_user_id=item.created_by_user_id,
        created_by_user_name=(
            item.created_by_user.full_name if item.created_by_user is not None else None
        ),
        assigned_to_user_id=item.assigned_to_user_id,
        assigned_to_user_name=(
            item.assigned_to_user.full_name if item.assigned_to_user is not None else None
        ),
        assigned_at=item.assigned_at,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


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
        items=[to_legal_request_item(item) for item in items],
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
    return to_legal_request_item(item)


@router.get("/queue", response_model=LegalQueueResponse)
def get_legal_queue(
    session: DatabaseSession,
    current_user: Annotated[
        User,
        Depends(
            require_roles(
                UserRole.LEGAL_COUNSEL,
                UserRole.SENIOR_LEGAL_COUNSEL,
                UserRole.CLO,
                UserRole.SYSTEM_ADMIN,
                UserRole.AUDITOR,
            )
        ),
    ],
) -> LegalQueueResponse:
    _ = current_user
    repository = LegalRequestRepository(session)
    items = repository.list_queue()
    return LegalQueueResponse(
        items=[to_legal_request_item(item) for item in items],
        summary=repository.build_queue_summary(items),
        total=len(items),
    )


@router.post("/{request_id}/assign", response_model=LegalRequestItem)
def assign_request(
    request_id: str,
    payload: AssignLegalRequestPayload,
    session: DatabaseSession,
    current_user: Annotated[
        User,
        Depends(
            require_roles(
                UserRole.LEGAL_COUNSEL,
                UserRole.SENIOR_LEGAL_COUNSEL,
                UserRole.SYSTEM_ADMIN,
            )
        ),
    ],
) -> LegalRequestItem:
    repository = LegalRequestRepository(session)
    request = repository.get_by_id(request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    assignee = UserRepository(session).get_legal_assignee(payload.assignee_user_id)
    if assignee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal assignee not found",
        )

    _ = current_user
    updated_request = repository.assign_request(request, assignee)
    return to_legal_request_item(updated_request)


@router.post("/{request_id}/status", response_model=LegalRequestItem)
def update_request_status(
    request_id: str,
    payload: UpdateLegalRequestStatusPayload,
    session: DatabaseSession,
    current_user: Annotated[
        User,
        Depends(
            require_roles(
                UserRole.LEGAL_COUNSEL,
                UserRole.SENIOR_LEGAL_COUNSEL,
                UserRole.SYSTEM_ADMIN,
            )
        ),
    ],
) -> LegalRequestItem:
    repository = LegalRequestRepository(session)
    request = repository.get_by_id(request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if (
        current_user.role == UserRole.LEGAL_COUNSEL
        and request.assigned_to_user_id not in {None, current_user.id}
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot move a request assigned to another lawyer",
        )

    try:
        updated_request = repository.update_status(request, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return to_legal_request_item(updated_request)
