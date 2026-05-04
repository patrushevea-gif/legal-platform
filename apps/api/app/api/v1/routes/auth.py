from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DatabaseSession, get_current_user
from app.core.security import create_access_token, verify_password
from app.entities.models import User
from app.models.schemas import AuthTokenResponse, CurrentUserResponse, LoginPayload
from app.repositories.user_repository import UserRepository


router = APIRouter()


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginPayload, session: DatabaseSession) -> AuthTokenResponse:
    user = UserRepository(session).get_by_email(payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return AuthTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=CurrentUserResponse.model_validate(user, from_attributes=True),
    )


@router.get("/me", response_model=CurrentUserResponse)
def me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user, from_attributes=True)
