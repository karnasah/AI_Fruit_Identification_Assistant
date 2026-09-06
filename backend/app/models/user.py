"""
User Model
Handles user authentication, profile, and preferences
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer, Enum, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    GENERAL = "general"
    FARMER = "farmer"
    VENDOR = "vendor"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BANNED = "banned"


class User(Base):
    """User model for authentication and profile"""
    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile fields
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Role and status
    role: Mapped[str] = mapped_column(Enum(UserRole), default=UserRole.GENERAL, nullable=False)
    status: Mapped[str] = mapped_column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    
    # Account flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    ban_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_active: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # User preferences (JSON)
    preferences: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Relationships
    identifications: Mapped[List["Identification"]] = relationship("Identification", back_populates="user", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, name={self.name}, role={self.role})>"
    
    @property
    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == UserRole.ADMIN.value
    
    @property
    def is_farmer(self) -> bool:
        """Check if user is farmer"""
        return self.role == UserRole.FARMER.value
    
    @property
    def is_vendor(self) -> bool:
        """Check if user is vendor"""
        return self.role == UserRole.VENDOR.value
    
    @property
    def get_preferences(self) -> dict:
        """Get user preferences with defaults"""
        defaults = {
            "theme": "light",
            "language": "en",
            "font_size": "medium",
            "reduced_motion": False,
            "high_contrast": False,
            "email_notifications": True,
            "push_notifications": False,
            "voice_input": True,
            "voice_output": False,
        }
        if self.preferences:
            defaults.update(self.preferences)
        return defaults