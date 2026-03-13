"""
SQLAlchemy ORM models — User, Asset, and AuditLog.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Application user with role-based access."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="operator")  # "admin" or "operator"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Asset(Base):
    """A trackable enterprise asset."""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    serial_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Registered")
    location = Column(String(100), nullable=False, default="Unknown")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationship
    audit_logs = relationship("AuditLog", back_populates="asset", order_by="AuditLog.changed_at.desc()")


class AuditLog(Base):
    """Immutable record of every status change."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    action = Column(String(50), nullable=False)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    old_location = Column(String(100), nullable=True)
    new_location = Column(String(100), nullable=True)
    changed_by = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    asset = relationship("Asset", back_populates="audit_logs")
