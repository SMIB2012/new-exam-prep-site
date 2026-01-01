"""Database base and model registry."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


# Note: Models are imported in app/models/__init__.py for Alembic discovery
# Importing them here causes circular imports
