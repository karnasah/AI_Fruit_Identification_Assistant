"""
Models Package
Database models for the Fruit AI Assistant
"""

from app.models.user import User
from app.models.fruit import Fruit
from app.models.favorite import Favorite
from app.models.identification import Identification
from app.models.chatbot import ChatSession, ChatMessage
from app.models.notification import Notification, NotificationPreference
from app.models.analytics import AnalyticsEvent, UserActivityLog, DailyStats

__all__ = [
    "User",
    "Fruit",
    "Favorite",
    "Identification",
    "ChatSession",
    "ChatMessage",
    "Notification",
    "NotificationPreference",
    "AnalyticsEvent",
    "UserActivityLog",
    "DailyStats",
]