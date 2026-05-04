from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


UserRole = Literal[
    "business_requester",
    "legal_counsel",
    "senior_legal_counsel",
    "clo",
    "external_consultant",
    "system_admin",
    "auditor",
]

LegalRequestType = Literal[
    "contract_review",
    "claim",
    "corporate_action",
    "procurement_support",
    "employment_matter",
    "general_consultation",
]

RequestPriority = Literal["low", "medium", "high", "critical"]
RequestStatus = Literal["new", "in_review", "waiting_for_info", "completed"]


class CreateLegalRequestPayload(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    request_type: LegalRequestType
    priority: RequestPriority
    business_unit: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=20, max_length=4000)


class LegalRequestItem(BaseModel):
    id: str
    title: str
    request_type: LegalRequestType
    priority: RequestPriority
    business_unit: str
    description: str
    status: RequestStatus
    created_by_user_id: str
    created_by_user_name: str | None = None
    assigned_to_user_id: str | None = None
    assigned_to_user_name: str | None = None
    assigned_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class LegalRequestListResponse(BaseModel):
    items: list[LegalRequestItem]
    total: int


class AssignLegalRequestPayload(BaseModel):
    assignee_user_id: str


class UpdateLegalRequestStatusPayload(BaseModel):
    status: RequestStatus


class QueueSummaryItem(BaseModel):
    key: str
    label: str
    count: int


class LegalQueueResponse(BaseModel):
    items: list[LegalRequestItem]
    summary: list[QueueSummaryItem]
    total: int


class LoginPayload(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=255)


class CurrentUserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    created_at: datetime


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: CurrentUserResponse
