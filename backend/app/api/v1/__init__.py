"""
API v1 Package
Contains all version 1 API route modules
"""

from app.api.v1 import (
    auth,
    users,
    fruits,
    chatbot,
    voice,
    encyclopedia,
    dashboard,
    admin,
    notifications,
    ai_expert,
)

__all__ = [
    "auth",
    "users",
    "fruits",
    "chatbot",
    "voice",
    "encyclopedia",
    "dashboard",
    "admin",
    "notifications",
    "ai_expert",
]