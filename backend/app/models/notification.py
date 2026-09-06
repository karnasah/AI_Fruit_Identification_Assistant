"""
Notification Model
Stores user notifications and alerts
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Notification(Base):
    """User notifications"""
    
    __tablename__ = "notifications"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Notification content
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # info, success, warning, error
    
    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Action/Link (optional)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    action_text: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
# Additional data
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")
    
    __table_args__ = (
        Index("idx_notifications_user_read", "user_id", "is_read"),
        Index("idx_notifications_user_created", "user_id", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, title={self.title}, is_read={self.is_read})>"
    
    def mark_as_read(self) -> None:
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
    
    @property
    def time_ago(self) -> str:
        """Get time ago string"""
        delta = datetime.utcnow() - self.created_at
        if delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        if delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        if delta.seconds > 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        return "just now"


class NotificationPreference(Base):
    """User notification preferences"""
    
    __tablename__ = "notification_preferences"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Email notifications
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    email_digest_frequency: Mapped[str] = mapped_column(String(20), default="daily")  # daily, weekly, never
    
    # Push notifications
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # In-app notification types
    identification_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    seasonal_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    achievement_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    promotional_alerts: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Push subscription (Web Push)
    push_subscription: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamp
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self) -> str:
        return f"<NotificationPreference(user_id={self.user_id})>"