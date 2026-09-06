"""
Analytics Model
Stores user activity and system analytics events
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, Float, JSON, ForeignKey, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AnalyticsEvent(Base):
    """User and system analytics events"""
    
    __tablename__ = "analytics_events"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Event details
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # identification, login, search, etc.
    event_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    # Event data
    event_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Performance metrics
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Context
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Session info
    session_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship("User")
    
    __table_args__ = (
        Index("idx_analytics_event_type_created", "event_type", "created_at"),
        Index("idx_analytics_user_created", "user_id", "created_at"),
        Index("idx_analytics_created_at", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<AnalyticsEvent(id={self.id}, event_type={self.event_type}, event_name={self.event_name})>"


class UserActivityLog(Base):
    """Detailed user activity log for audit trail"""
    
    __tablename__ = "user_activity_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Activity details
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Changes (before/after)
    changes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Context
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Status
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index("idx_activity_user_created", "user_id", "created_at"),
        Index("idx_activity_action_created", "action", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<UserActivityLog(id={self.id}, user_id={self.user_id}, action={self.action})>"


class DailyStats(Base):
    """Daily aggregated statistics for system monitoring"""
    
    __tablename__ = "daily_stats"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[datetime] = mapped_column(DateTime, unique=True, nullable=False)
    
    # User stats
    new_users: Mapped[int] = mapped_column(Integer, default=0)
    active_users: Mapped[int] = mapped_column(Integer, default=0)
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    
    # Identification stats
    total_identifications: Mapped[int] = mapped_column(Integer, default=0)
    successful_identifications: Mapped[int] = mapped_column(Integer, default=0)
    average_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Chatbot stats
    total_chat_messages: Mapped[int] = mapped_column(Integer, default=0)
    unique_chat_users: Mapped[int] = mapped_column(Integer, default=0)
    
    # API stats
    api_requests: Mapped[int] = mapped_column(Integer, default=0)
    average_response_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Error stats
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    
# Additional data
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    def __repr__(self) -> str:
        return f"<DailyStats(date={self.date}, new_users={self.new_users})>"