from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.entities.models import User, UserRole
from app.repositories.user_repository import UserRepository


def seed_demo_users(session: Session) -> None:
    repository = UserRepository(session)

    seed_users = [
        {
            "email": "requester@legal-platform.local",
            "full_name": "Business Requester Demo",
            "role": UserRole.BUSINESS_REQUESTER,
            "password": "Requester123!",
        },
        {
            "email": "lawyer@legal-platform.local",
            "full_name": "Legal Counsel Demo",
            "role": UserRole.LEGAL_COUNSEL,
            "password": "Lawyer123!",
        },
        {
            "email": "admin@legal-platform.local",
            "full_name": "System Admin Demo",
            "role": UserRole.SYSTEM_ADMIN,
            "password": "Admin123!",
        },
    ]

    for seed_user in seed_users:
        if repository.get_by_email(seed_user["email"]) is not None:
            continue
        repository.add(
            User(
                email=seed_user["email"],
                full_name=seed_user["full_name"],
                role=seed_user["role"],
                password_hash=hash_password(seed_user["password"]),
            )
        )
