from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.entities.models import (
    LegalRequest,
    LegalRequestType,
    RequestPriority,
    RequestStatus,
    User,
    UserRole,
)
from app.models.schemas import (
    CreateLegalRequestPayload,
    QueueSummaryItem,
    UpdateLegalRequestStatusPayload,
)


class LegalRequestRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_visible_requests(self, user: User) -> list[LegalRequest]:
        statement = (
            select(LegalRequest)
            .options(
                joinedload(LegalRequest.created_by_user),
                joinedload(LegalRequest.assigned_to_user),
            )
            .order_by(LegalRequest.created_at.desc())
        )
        if user.role == UserRole.BUSINESS_REQUESTER:
            statement = statement.where(LegalRequest.created_by_user_id == user.id)
        return list(self.session.scalars(statement))

    def create_request(
        self,
        *,
        payload: CreateLegalRequestPayload,
        created_by: User,
    ) -> LegalRequest:
        request = LegalRequest(
            title=payload.title,
            request_type=LegalRequestType(payload.request_type),
            priority=RequestPriority(payload.priority),
            business_unit=payload.business_unit,
            description=payload.description,
            status=RequestStatus.NEW,
            created_by_user_id=created_by.id,
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request

    def get_by_id(self, request_id: str) -> LegalRequest | None:
        statement = (
            select(LegalRequest)
            .options(
                joinedload(LegalRequest.created_by_user),
                joinedload(LegalRequest.assigned_to_user),
            )
            .where(LegalRequest.id == request_id)
        )
        return self.session.scalar(statement)

    def assign_request(self, request: LegalRequest, assignee: User) -> LegalRequest:
        request.assigned_to_user_id = assignee.id
        request.assigned_at = datetime.now(UTC)
        if request.status == RequestStatus.NEW:
            request.status = RequestStatus.IN_REVIEW
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request

    def update_status(
        self,
        request: LegalRequest,
        payload: UpdateLegalRequestStatusPayload,
    ) -> LegalRequest:
        target_status = RequestStatus(payload.status)
        allowed_transitions: dict[RequestStatus, set[RequestStatus]] = {
            RequestStatus.NEW: {
                RequestStatus.IN_REVIEW,
                RequestStatus.WAITING_FOR_INFO,
                RequestStatus.COMPLETED,
            },
            RequestStatus.IN_REVIEW: {
                RequestStatus.WAITING_FOR_INFO,
                RequestStatus.COMPLETED,
            },
            RequestStatus.WAITING_FOR_INFO: {
                RequestStatus.IN_REVIEW,
                RequestStatus.COMPLETED,
            },
            RequestStatus.COMPLETED: {RequestStatus.COMPLETED},
        }

        if target_status not in allowed_transitions[request.status]:
            raise ValueError(
                f"Cannot move request from {request.status.value} to {target_status.value}"
            )

        request.status = target_status
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request

    def list_queue(self) -> list[LegalRequest]:
        statement = (
            select(LegalRequest)
            .options(
                joinedload(LegalRequest.created_by_user),
                joinedload(LegalRequest.assigned_to_user),
            )
            .order_by(LegalRequest.priority.desc(), LegalRequest.created_at.asc())
        )
        return list(self.session.scalars(statement))

    def build_queue_summary(self, items: list[LegalRequest]) -> list[QueueSummaryItem]:
        summary_counts = {
            "new": sum(item.status == RequestStatus.NEW for item in items),
            "in_review": sum(item.status == RequestStatus.IN_REVIEW for item in items),
            "waiting_for_info": sum(
                item.status == RequestStatus.WAITING_FOR_INFO for item in items
            ),
            "unassigned": sum(item.assigned_to_user_id is None for item in items),
        }
        return [
            QueueSummaryItem(key="new", label="Новые", count=summary_counts["new"]),
            QueueSummaryItem(
                key="in_review",
                label="В работе",
                count=summary_counts["in_review"],
            ),
            QueueSummaryItem(
                key="waiting_for_info",
                label="Ждут данных",
                count=summary_counts["waiting_for_info"],
            ),
            QueueSummaryItem(
                key="unassigned",
                label="Без исполнителя",
                count=summary_counts["unassigned"],
            ),
        ]
