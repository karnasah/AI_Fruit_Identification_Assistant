"""
Schemas Package
Pydantic models for request/response validation
"""

from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    VerifyEmailRequest,
    MessageResponse,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserSettings,
    UserSettingsUpdate,
    UserStatsResponse,
    ChangePasswordRequest,
)
from app.schemas.fruit import (
    FruitBase,
    FruitCreate,
    FruitUpdate,
    FruitResponse,
    FruitDetailResponse,
    FruitListItemResponse,
    FruitNutritionResponse,
    FruitCompareResponse,
    IdentificationResponse,
    IdentificationDetailResponse,
    IdentificationHistoryResponse,
    BatchIdentificationResponse,
    FavoriteResponse,
)
from app.schemas.identification import (
    IdentificationBase,
    IdentificationCreate,
    RipenessDetectionResponse,
    DiseaseDetectionResponse,
)
from app.schemas.chatbot import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatHistoryResponse,
    ChatSuggestionResponse,
    ChatFeedbackRequest,
)

__all__ = [
    # Auth
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    "VerifyEmailRequest",
    "MessageResponse",
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserSettings",
    "UserSettingsUpdate",
    "UserStatsResponse",
    "ChangePasswordRequest",
    # Fruit
    "FruitBase",
    "FruitCreate",
    "FruitUpdate",
    "FruitResponse",
    "FruitDetailResponse",
    "FruitListItemResponse",
    "FruitNutritionResponse",
    "FruitCompareResponse",
    "IdentificationResponse",
    "IdentificationDetailResponse",
    "IdentificationHistoryResponse",
    "BatchIdentificationResponse",
    "FavoriteResponse",
    # Identification
    "IdentificationBase",
    "IdentificationCreate",
    "RipenessDetectionResponse",
    "DiseaseDetectionResponse",
    # Chatbot
    "ChatMessageRequest",
    "ChatMessageResponse",
    "ChatSessionResponse",
    "ChatHistoryResponse",
    "ChatSuggestionResponse",
    "ChatFeedbackRequest",
]