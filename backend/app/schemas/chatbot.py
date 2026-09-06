"""
Chatbot Schemas
Pydantic models for chatbot conversations and messages
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    """Chat message request schema"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: Optional[str] = Field(None, description="Existing session ID")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class ChatMessageResponse(BaseModel):
    """Chat message response schema"""
    id: Optional[int] = None
    reply: str = Field(..., description="Bot response")
    intent: Optional[str] = Field(None, description="Detected intent")
    confidence: Optional[float] = Field(None, description="Intent confidence")
    suggestions: Optional[List[str]] = Field([], description="Suggested follow-up questions")
    session_id: Optional[str] = None
    sender: Optional[str] = None
    timestamp: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    """Chat session response schema"""
    id: int
    session_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    messages: Optional[List[ChatMessageResponse]] = []
    
    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    """Chat history response schema"""
    sessions: Optional[List[ChatSessionResponse]] = []
    messages: Optional[List[ChatMessageResponse]] = []
    total: int = 0
    page: int = 1
    limit: int = 20


class ChatSuggestionResponse(BaseModel):
    """Chat suggestion response schema"""
    text: str
    icon: Optional[str] = None
    confidence: float = 1.0


class ChatFeedbackRequest(BaseModel):
    """Chat feedback request schema"""
    helpful: bool = Field(..., description="Whether the response was helpful")
    feedback: Optional[str] = Field(None, max_length=500, description="Additional feedback text")


class IntentResponse(BaseModel):
    """Intent response schema (admin)"""
    id: str
    name: str
    description: Optional[str] = None
    examples: List[str] = []
    responses: List[str] = []
    confidence_threshold: float = 0.7
    is_active: bool = True
    
    class Config:
        from_attributes = True


class TrainingDataResponse(BaseModel):
    """Training data response schema"""
    intents: List[IntentResponse]
    total_examples: int
    version: str
    last_trained: Optional[datetime] = None


class ChatAnalyticsResponse(BaseModel):
    """Chatbot analytics response"""
    total_sessions: int = 0
    total_messages: int = 0
    unique_users: int = 0
    average_session_duration: float = 0.0
    top_intents: List[Dict[str, Any]] = []
    satisfaction_rate: float = 0.0
    daily_activity: List[Dict[str, Any]] = []