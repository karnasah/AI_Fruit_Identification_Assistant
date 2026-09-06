"""
User Schemas
Pydantic models for user management and profile
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base user schema"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=6)
    role: str = Field("general")
    
    @validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v


class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    last_active: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserSettings(BaseModel):
    """User settings schema"""
    theme: str = Field("light", pattern="^(light|dark|system)$")
    language: str = Field("en", min_length=2, max_length=5)
    font_size: str = Field("medium", pattern="^(small|medium|large)$")
    reduced_motion: bool = False
    high_contrast: bool = False
    email_notifications: bool = True
    push_notifications: bool = False
    identification_alerts: bool = True
    seasonal_alerts: bool = True
    achievement_alerts: bool = True
    voice_input: bool = True
    voice_output: bool = False
    auto_save: bool = True


class UserSettingsUpdate(BaseModel):
    """User settings update schema"""
    theme: Optional[str] = Field(None, pattern="^(light|dark|system)$")
    language: Optional[str] = Field(None, min_length=2, max_length=5)
    font_size: Optional[str] = Field(None, pattern="^(small|medium|large)$")
    reduced_motion: Optional[bool] = None
    high_contrast: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    identification_alerts: Optional[bool] = None
    seasonal_alerts: Optional[bool] = None
    achievement_alerts: Optional[bool] = None
    voice_input: Optional[bool] = None
    voice_output: Optional[bool] = None
    auto_save: Optional[bool] = None


class UserStatsResponse(BaseModel):
    """User statistics response"""
    total_identifications: int = 0
    unique_fruits: int = 0
    favorite_fruits: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    success_rate: float = 0.0
    total_chat_messages: int = 0
    member_days: int = 0


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    
    @validator('new_password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v


class UserActivityResponse(BaseModel):
    """User activity response"""
    id: int
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True