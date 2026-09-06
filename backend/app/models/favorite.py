"""
Favorite Model
Stores user's favorite fruits
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, Text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Favorite(Base):
    """User favorite fruits"""
    
    __tablename__ = "favorites"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fruit_id: Mapped[int] = mapped_column(Integer, ForeignKey("fruits.id", ondelete="CASCADE"), nullable=False)
    
    # Additional info
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    fruit: Mapped["Fruit"] = relationship("Fruit", back_populates="favorites")
    
    # Ensure a user can only favorite a fruit once
    __table_args__ = (
        UniqueConstraint("user_id", "fruit_id", name="uq_user_favorite"),
        Index("idx_favorites_user_created", "user_id", "created_at"),
        Index("idx_favorites_fruit_id", "fruit_id"),
    )
    
    def __repr__(self) -> str:
        return f"<Favorite(id={self.id}, user_id={self.user_id}, fruit_id={self.fruit_id})>"