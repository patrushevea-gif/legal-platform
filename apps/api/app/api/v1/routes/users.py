from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DatabaseSession, require_roles
from app.entities.models import User, UserRole
from app.models.schemas import LegalTeamMemberResponse
from app.repositories.user_repository import UserRepository


router = APIRouter()


@router.get("/legal-team", response_model=list[LegalTeamMemberResponse])
def list_legal_team(
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
) -> list[LegalTeamMemberResponse]:
    _ = current_user
    members = UserRepository(session).list_legal_team()
    return [
        LegalTeamMemberResponse.model_validate(member, from_attributes=True)
        for member in members
    ]
