"""
Chatbot Models
Stores chat sessions and messages for the AI chatbot
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class ChatSession(Base):
    """Chat session for user conversations"""
    
    __tablename__ = "chat_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Session details
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    context: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Metadata
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="chat_sessions")
    messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_chat_sessions_user_updated", "user_id", "updated_at"),
    )
    
    def __repr__(self) -> str:
        return f"<ChatSession(id={self.id}, session_id={self.session_id}, user_id={self.user_id})>"


class ChatMessage(Base):
    """Individual chat message in a session"""
    
    __tablename__ = "chat_messages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Message content
    message: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' or 'bot'
    
    # NLP metadata
    intent: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    entities: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Response metadata (for bot messages)
    suggestions: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    context_used: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    
    # Feedback
    feedback_helpful: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    feedback_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
    user: Mapped[Optional["User"]] = relationship("User")
    
    __table_args__ = (
        Index("idx_chat_messages_session_created", "session_id", "created_at"),
        Index("idx_chat_messages_user_created", "user_id", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<ChatMessage(id={self.id}, session_id={self.session_id}, sender={self.sender})>"
    
    @property
    def is_user_message(self) -> bool:
        """Check if message is from user"""
        return self.sender == "user"
    
    @property
    def is_bot_message(self) -> bool:
        """Check if message is from bot"""
        return self.sender == "bot"
    
    @property
    def has_feedback(self) -> bool:
        """Check if feedback was provided"""
        return self.feedback_helpful is not None
    
    @property
    def confidence_percentage(self) -> Optional[int]:
        """Get confidence as percentage"""
        if self.confidence:
            return int(self.confidence * 100)
        return None