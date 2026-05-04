from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities.models import LegalRequest, RequestStatus, User, UserRole
from app.models.schemas import CreateLegalRequestPayload


class LegalRequestRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_visible_requests(self, user: User) -> list[LegalRequest]:
        statement = select(LegalRequest).order_by(LegalRequest.created_at.desc())
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
            request_type=payload.request_type,
            priority=payload.priority,
            business_unit=payload.business_unit,
            description=payload.description,
            status=RequestStatus.NEW,
            created_by_user_id=created_by.id,
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request
