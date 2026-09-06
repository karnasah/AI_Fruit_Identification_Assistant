"""
Identification Model
Stores user fruit identification history
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Identification(Base):
    """User fruit identification history"""
    
    __tablename__ = "identifications"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fruit_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("fruits.id", ondelete="SET NULL"), nullable=True)
    
    # Identification details
    fruit_name: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Top predictions (JSON array)
    top_predictions: Mapped[Optional[List[dict]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Image
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Additional detection results
    ripeness: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ripeness_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    disease: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    disease_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Bounding boxes for multiple fruits
    bounding_boxes: Mapped[Optional[List[dict]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Metadata
    is_successful: Mapped[bool] = mapped_column(Boolean, default=True)
    processing_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="identifications")
    fruit: Mapped["Fruit"] = relationship("Fruit", back_populates="identifications")
    
    # Indexes for faster queries
    __table_args__ = (
        Index("idx_identifications_user_created", "user_id", "created_at"),
        Index("idx_identifications_fruit_name", "fruit_name"),
    )
    
    def __repr__(self) -> str:
        return f"<Identification(id={self.id}, user_id={self.user_id}, fruit={self.fruit_name}, confidence={self.confidence})>"
    
    @property
    def confidence_percentage(self) -> int:
        """Get confidence as percentage"""
        return int(self.confidence * 100)
    
    @property
    def is_high_confidence(self) -> bool:
        """Check if confidence is high (>80%)"""
        return self.confidence >= 0.8
    
    @property
    def is_medium_confidence(self) -> bool:
        """Check if confidence is medium (60-80%)"""
        return 0.6 <= self.confidence < 0.8
    
    @property
    def is_low_confidence(self) -> bool:
        """Check if confidence is low (<60%)"""
        return self.confidence < 0.6
    
    @property
    def get_top_prediction_names(self) -> List[str]:
        """Get list of top prediction fruit names"""
        if self.top_predictions:
            return [p.get("name", "") for p in self.top_predictions[:3]]
        return []
    
    @property
    def has_disease(self) -> bool:
        """Check if disease was detected"""
        return self.disease is not None and self.disease != "healthy"