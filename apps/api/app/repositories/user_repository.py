from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities.models import User, UserRole


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email.lower())
        return self.session.scalar(statement)

    def get_by_id(self, user_id: str) -> User | None:
        statement = select(User).where(User.id == user_id)
        return self.session.scalar(statement)

    def add(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_legal_assignee(self, user_id: str) -> User | None:
        statement = select(User).where(
            User.id == user_id,
            User.role.in_([UserRole.LEGAL_COUNSEL, UserRole.SENIOR_LEGAL_COUNSEL]),
        )
        return self.session.scalar(statement)

    def list_legal_team(self) -> list[User]:
        statement = (
            select(User)
            .where(User.role.in_([UserRole.LEGAL_COUNSEL, UserRole.SENIOR_LEGAL_COUNSEL]))
            .order_by(User.full_name.asc())
        )
        return list(self.session.scalars(statement))
