"""
Notification Schemas
Pydantic models for notification data
"""

from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    data: Optional[dict] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    read: bool
    created_at: datetime
    action_url: Optional[str] = None
    action_text: Optional[str] = None

class NotificationPreferences(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    email_notifications: bool = True
    email_digest_frequency: str = "daily"
    push_notifications: bool = False
    identification_alerts: bool = True
    seasonal_alerts: bool = True
    achievement_alerts: bool = True
    promotional_alerts: bool = False

class NotificationPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    email_digest_frequency: Optional[str] = None
    push_notifications: Optional[bool] = None
    identification_alerts: Optional[bool] = None
    seasonal_alerts: Optional[bool] = None
    achievement_alerts: Optional[bool] = None
    promotional_alerts: Optional[bool] = None

class PaginatedNotificationResponse(BaseModel):
    data: List[NotificationResponse]
    total: int
    page: int
    limit: int
    pages: int

class MessageResponse(BaseModel):
    message: str
    data: Optional[dict] = None
