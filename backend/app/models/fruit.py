"""
Fruit Model
Represents fruit information in the encyclopedia
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Fruit(Base):
    """Fruit model for encyclopedia"""
    
    __tablename__ = "fruits"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    scientific_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Visual
    emoji: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    images: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Nutritional information (JSON)
    nutrition: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Seasonal information
    season: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    peak_months: Mapped[Optional[List[int]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Health benefits
    benefits: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Storage and growing
    storage_tips: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    growing_tips: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Recipes
    recipes: Mapped[Optional[List[dict]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Fun facts
    fun_facts: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Origin
    origin_countries: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    
    # Price information
    price_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Metadata
    popularity: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    identifications: Mapped[List["Identification"]] = relationship("Identification", back_populates="fruit")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="fruit", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Fruit(id={self.id}, name={self.name}, category={self.category})>"
    
    @property
    def calories(self) -> Optional[int]:
        """Get calories from nutrition data"""
        if self.nutrition:
            return self.nutrition.get("calories")
        return None
    
    @property
    def get_nutrition_summary(self) -> dict:
        """Get summarized nutrition info"""
        if not self.nutrition:
            return {}
        return {
            "calories": self.nutrition.get("calories", 0),
            "carbs": self.nutrition.get("carbs", "0g"),
            "protein": self.nutrition.get("protein", "0g"),
            "fat": self.nutrition.get("fat", "0g"),
            "fiber": self.nutrition.get("fiber", "0g"),
        }