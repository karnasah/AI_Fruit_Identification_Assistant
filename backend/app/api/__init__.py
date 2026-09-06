"""
API Package
Contains all API routes and endpoints for the Fruit AI Assistant
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
]