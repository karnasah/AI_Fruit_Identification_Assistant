"""
Chatbot API Endpoints
AI-powered chatbot for fruit-related queries
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, OptionalCurrentUser
from app.schemas.chatbot import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatHistoryResponse,
    ChatSuggestionResponse,
    ChatFeedbackRequest,
    IntentResponse,  # Added this import
)
from app.schemas.auth import MessageResponse
from app.services.chatbot_service import ChatbotService
from app.services.nlp_processor import NLPProcessor  # Fixed import name
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: OptionalCurrentUser,
    db: DBSession,
):
    """
    Send a message to the chatbot and get AI response
    """
    service = ChatbotService(db)
    
    # Get or create session
    session_id = request.session_id
    if not session_id:
        session = await service.create_session(current_user.id if current_user else None)
        session_id = session.session_id
    else:
        session = await service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found",
            )
    
    # Save user message
    user_message = await service.save_message(
        session_id=session_id,
        message=request.message,
        sender="user",
        user_id=current_user.id if current_user else None,
    )
    
    # Get bot response
    nlp_processor = NLPProcessor()
    
    # Check for fruit context (if last identified fruit)
    context = request.context or {}
    last_fruit = context.get("last_fruit")
    
    response_text, intent, confidence, suggestions = await nlp_processor.process_message(
        message=request.message,
        context=context,
        last_fruit=last_fruit,
    )
    
    # Save bot message
    bot_message = await service.save_message(
        session_id=session_id,
        message=response_text,
        sender="bot",
        user_id=current_user.id if current_user else None,
        intent=intent,
        confidence=confidence,
        metadata={
            "suggestions": suggestions,
            "context": context,
        },
    )
    
    # Update session timestamp
    await service.update_session_timestamp(session_id)
    
    return ChatMessageResponse(
        id=bot_message.id,
        reply=response_text,
        intent=intent,
        confidence=confidence,
        suggestions=suggestions,
        session_id=session_id,
    )


@router.post("/message-with-context", response_model=ChatMessageResponse)
async def send_message_with_context(
    request: ChatMessageRequest,
    current_user: OptionalCurrentUser,
    db: DBSession,
):
    """
    Send a message with additional context (e.g., last identified fruit)
    """
    return await send_message(request, current_user, db)


@router.post("/new-session", response_model=ChatSessionResponse)
async def create_new_session(
    current_user: OptionalCurrentUser,
    db: DBSession,
):
    """
    Create a new chat session
    """
    service = ChatbotService(db)
    session = await service.create_session(current_user.id if current_user else None)
    
    return ChatSessionResponse(
        id=session.id,
        session_id=session.session_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    current_user: CurrentUser,
    db: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    session_id: Optional[str] = None,
):
    """
    Get user's chat history
    """
    service = ChatbotService(db)
    
    if session_id:
        # Get specific session
        session = await service.get_session(session_id)
        if not session or session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        messages = await service.get_session_messages(session_id)
        return ChatHistoryResponse(
            messages=[ChatMessageResponse(
                id=m.id,
                reply=m.message,
                intent=m.intent,
                confidence=m.confidence,
                session_id=session_id,
                timestamp=m.created_at,
            ) for m in messages],
            total=len(messages),
            page=page,
            limit=limit,
        )
    else:
        # Get all user sessions
        sessions, total = await service.get_user_sessions(
            user_id=current_user.id,
            page=page,
            limit=limit,
        )
        
        return ChatHistoryResponse(
            sessions=[ChatSessionResponse(
                id=s.id,
                session_id=s.session_id,
                title=s.title,
                created_at=s.created_at,
                updated_at=s.updated_at,
                message_count=s.message_count,
            ) for s in sessions],
            total=total,
            page=page,
            limit=limit,
        )


@router.get("/session/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get a specific chat session
    """
    service = ChatbotService(db)
    session = await service.get_session(session_id)
    
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    
    messages = await service.get_session_messages(session_id)
    
    return ChatSessionResponse(
        id=session.id,
        session_id=session.session_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=[ChatMessageResponse(
            id=m.id,
            reply=m.message,
            sender=m.sender,
            intent=m.intent,
            confidence=m.confidence,
            timestamp=m.created_at,
        ) for m in messages],
    )


@router.delete("/history", response_model=MessageResponse)
async def clear_chat_history(
    current_user: CurrentUser,
    db: DBSession,
    session_id: Optional[str] = None,
):
    """
    Clear chat history (specific session or all)
    """
    service = ChatbotService(db)
    
    if session_id:
        # Clear specific session
        success = await service.clear_session(session_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
    else:
        # Clear all user sessions
        await service.clear_all_sessions(current_user.id)
    
    return MessageResponse(message="Chat history cleared successfully")


@router.delete("/message/{message_id}", response_model=MessageResponse)
async def delete_message(
    message_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Delete a specific message
    """
    service = ChatbotService(db)
    success = await service.delete_message(message_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return MessageResponse(message="Message deleted successfully")


@router.get("/suggestions", response_model=List[ChatSuggestionResponse])
async def get_suggested_questions(
    db: DBSession,
    context: Optional[str] = None,
):
    """
    Get suggested questions based on context
    """
    nlp_processor = NLPProcessor()
    suggestions = await nlp_processor.get_suggestions(context)
    
    return suggestions


@router.get("/fruit-suggestions/{fruit_name}", response_model=List[ChatSuggestionResponse])
async def get_fruit_suggestions(
    fruit_name: str,
    db: DBSession,
):
    """
    Get fruit-specific suggested questions
    """
    suggestions = [
        ChatSuggestionResponse(
            text=f"What are the health benefits of {fruit_name}?",
            icon="💪",
            confidence=0.95,
        ),
        ChatSuggestionResponse(
            text=f"How to store {fruit_name}?",
            icon="📦",
            confidence=0.92,
        ),
        ChatSuggestionResponse(
            text=f"Recipes using {fruit_name}",
            icon="🍳",
            confidence=0.89,
        ),
        ChatSuggestionResponse(
            text=f"When is {fruit_name} in season?",
            icon="📅",
            confidence=0.88,
        ),
        ChatSuggestionResponse(
            text=f"How many calories in {fruit_name}?",
            icon="🔥",
            confidence=0.85,
        ),
    ]
    
    return suggestions


@router.post("/feedback/{message_id}", response_model=MessageResponse)
async def submit_feedback(
    message_id: int,
    feedback: ChatFeedbackRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Submit feedback for a chatbot response
    """
    service = ChatbotService(db)
    success = await service.save_feedback(
        message_id=message_id,
        user_id=current_user.id,
        helpful=feedback.helpful,
        feedback_text=feedback.feedback,
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return MessageResponse(message="Feedback submitted successfully")


@router.get("/faqs", response_model=List[ChatSuggestionResponse])
async def get_faqs(
    db: DBSession,
):
    """
    Get frequently asked questions
    """
    faqs = [
        ChatSuggestionResponse(
            text="How accurate is the fruit identification?",
            icon="🎯",
            confidence=1.0,
        ),
        ChatSuggestionResponse(
            text="What fruits can the system identify?",
            icon="🍎",
            confidence=1.0,
        ),
        ChatSuggestionResponse(
            text="How do I use the live camera feature?",
            icon="📷",
            confidence=1.0,
        ),
        ChatSuggestionResponse(
            text="Is my data private and secure?",
            icon="🔒",
            confidence=1.0,
        ),
        ChatSuggestionResponse(
            text="Can I use this for commercial purposes?",
            icon="💼",
            confidence=1.0,
        ),
    ]
    
    return faqs


@router.get("/search", response_model=List[ChatMessageResponse])
async def search_chat_history(
    current_user: CurrentUser,
    db: DBSession,
    q: str = Query(..., min_length=2),
):
    """
    Search through user's chat history
    """
    service = ChatbotService(db)
    results = await service.search_messages(current_user.id, q)
    
    return [ChatMessageResponse(
        id=r.id,
        reply=r.message,
        sender=r.sender,
        timestamp=r.created_at,
    ) for r in results]


# ========================================
# Admin-only endpoints for training
# ========================================

@router.get("/intents", response_model=List[IntentResponse])
async def get_all_intents(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get all chatbot intents (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    nlp_processor = NLPProcessor()
    intents = await nlp_processor.get_all_intents()
    
    return intents


@router.post("/intents", response_model=IntentResponse)
async def add_intent(
    intent_data: dict,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Add a new intent (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    nlp_processor = NLPProcessor()
    intent = await nlp_processor.add_intent(intent_data)
    
    return intent


@router.put("/intents/{intent_id}", response_model=IntentResponse)
async def update_intent(
    intent_id: str,
    intent_data: dict,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Update an intent (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    nlp_processor = NLPProcessor()
    intent = await nlp_processor.update_intent(intent_id, intent_data)
    
    return intent


@router.delete("/intents/{intent_id}", response_model=MessageResponse)
async def delete_intent(
    intent_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Delete an intent (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    nlp_processor = NLPProcessor()
    success = await nlp_processor.delete_intent(intent_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intent not found",
        )
    
    return MessageResponse(message="Intent deleted successfully")


@router.post("/train", response_model=MessageResponse)
async def train_chatbot(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Train the chatbot model (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    nlp_processor = NLPProcessor()
    await nlp_processor.train_model()
    
    return MessageResponse(message="Chatbot training started")


@router.get("/analytics", response_model=dict)
async def get_chatbot_analytics(
    current_user: CurrentUser,
    db: DBSession,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """
    Get chatbot analytics (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    service = ChatbotService(db)
    analytics = await service.get_analytics(start_date, end_date)
    
    return analytics