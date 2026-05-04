from datetime import UTC, datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class UserRole(str, Enum):
    BUSINESS_REQUESTER = "business_requester"
    LEGAL_COUNSEL = "legal_counsel"
    SENIOR_LEGAL_COUNSEL = "senior_legal_counsel"
    CLO = "clo"
    EXTERNAL_CONSULTANT = "external_consultant"
    SYSTEM_ADMIN = "system_admin"
    AUDITOR = "auditor"


class LegalRequestType(str, Enum):
    CONTRACT_REVIEW = "contract_review"
    CLAIM = "claim"
    CORPORATE_ACTION = "corporate_action"
    PROCUREMENT_SUPPORT = "procurement_support"
    EMPLOYMENT_MATTER = "employment_matter"
    GENERAL_CONSULTATION = "general_consultation"


class RequestPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RequestStatus(str, Enum):
    NEW = "new"
    IN_REVIEW = "in_review"
    WAITING_FOR_INFO = "waiting_for_info"
    COMPLETED = "completed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    legal_requests: Mapped[list["LegalRequest"]] = relationship(
        back_populates="created_by_user"
    )


class LegalRequest(Base):
    __tablename__ = "legal_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    title: Mapped[str] = mapped_column(String(200))
    request_type: Mapped[LegalRequestType] = mapped_column(SqlEnum(LegalRequestType))
    priority: Mapped[RequestPriority] = mapped_column(SqlEnum(RequestPriority))
    business_unit: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text())
    status: Mapped[RequestStatus] = mapped_column(
        SqlEnum(RequestStatus),
        default=RequestStatus.NEW,
    )
    created_by_user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    created_by_user: Mapped[User] = relationship(back_populates="legal_requests")
