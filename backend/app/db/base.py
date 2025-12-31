"""Database base and model registry."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


# Import all models here so Alembic can detect them
from app.models import (  # noqa: F401
    MFATOTP,
    AttemptAnswer,
    AttemptSession,
    Block,
    MFABackupCode,
    OAuthIdentity,
    PasswordResetToken,
    Question,
    RefreshToken,
    Theme,
    User,
)
