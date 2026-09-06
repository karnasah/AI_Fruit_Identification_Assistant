"""
Dashboard Schemas
Pydantic models for dashboard and analytics data
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field, ConfigDict, AliasGenerator, computed_field
from pydantic.alias_generators import to_camel
from datetime import datetime


class DashboardStatsResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
            validation_alias=to_camel,
        ),
        populate_by_name=True
    )

    total_identifications: int = 0
    unique_fruits: int = 0
    success_rate: float = 0.0
    streak: int = 0
    favorites_count: int = 0
    active_days: int = 0
    total_identifications_change: float = 0.0
    unique_fruits_change: float = 0.0
    success_rate_change: float = 0.0
    streak_change: int = 0
    
    @computed_field
    @property
    def total(self) -> int:
        return self.total_identifications
    
    @computed_field
    @property
    def unique_fruits_count(self) -> int:
        return self.unique_fruits

    @computed_field
    @property
    def success_rate_pct(self) -> float:
        return self.success_rate

    @computed_field
    @property
    def uniqueFruits(self) -> int:
        return self.unique_fruits
    
    @computed_field
    @property
    def successRate(self) -> float:
        return self.success_rate


class IdentificationAnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    labels: List[str]
    data: List[int]
    total: int = 0
    average: float = 0.0
    peak: int = 0
    peak_date: Optional[str] = None


class MostIdentifiedFruitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    count: int
    emoji: Optional[str] = None
    percentage: float = 0.0


class UserActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    activities: List[Dict]
    total: int = 0


class StreakResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    current_streak: int = 0
    longest_streak: int = 0
    last_active: Optional[str] = None
    next_milestone: int = 0
    days_to_next_milestone: int = 0


class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    icon: Optional[str] = None
    earned: bool = False
    earned_at: Optional[str] = None
    progress: int = 0
    target: int = 0


class LeaderboardEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rank: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    score: int = 0
    identifications: int = 0
    streak: int = 0


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    read: bool = False
    created_at: str
    data: Optional[Dict] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    """Simple message response"""
    message: str
    data: Optional[dict] = None