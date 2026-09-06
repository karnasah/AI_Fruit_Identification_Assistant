"""
Chatbot Service
Handles chat sessions, message management, and conversation history
"""

from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.models.chatbot import ChatSession, ChatMessage
from app.utils.logger import logger


class ChatbotService:
    """Service for chatbot operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ==================== Session Management ====================
    
    async def create_session(self, user_id: Optional[int] = None) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(
            session_id=str(uuid4()),
            user_id=user_id,
            title="New Conversation",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        logger.info(f"Chat session created: {session.session_id}")
        return session
    
    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get chat session by ID"""
        result = await self.db.execute(
            select(ChatSession).where(ChatSession.session_id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_sessions(
        self,
        user_id: int,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[ChatSession], int]:
        """Get user's chat sessions"""
        query = select(ChatSession).where(ChatSession.user_id == user_id)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.order_by(desc(ChatSession.updated_at))
        query = query.offset((page - 1) * limit).limit(limit)
        
        result = await self.db.execute(query)
        sessions = result.scalars().all()
        
        return list(sessions), total
    
    async def update_session_timestamp(self, session_id: str) -> None:
        """Update session's last activity timestamp"""
        session = await self.get_session(session_id)
        if session:
            session.updated_at = datetime.utcnow()
            await self.db.commit()
    
    async def update_session_title(self, session_id: str, title: str) -> None:
        """Update session title"""
        session = await self.get_session(session_id)
        if session:
            session.title = title[:200]
            await self.db.commit()
    
    async def clear_session(self, session_id: str, user_id: int) -> bool:
        """Clear all messages in a session"""
        session = await self.get_session(session_id)
        if not session or session.user_id != user_id:
            return False
        
        # Delete all messages in session
        result = await self.db.execute(
            select(ChatMessage).where(ChatMessage.session_id == session.id)
        )
        messages = result.scalars().all()
        
        for message in messages:
            await self.db.delete(message)
        
        session.message_count = 0
        await self.db.commit()
        
        logger.info(f"Cleared session: {session_id}")
        return True
    
    async def clear_all_sessions(self, user_id: int) -> None:
        """Clear all sessions for a user"""
        result = await self.db.execute(
            select(ChatSession).where(ChatSession.user_id == user_id)
        )
        sessions = result.scalars().all()
        
        for session in sessions:
            await self.clear_session(session.session_id, user_id)
        
        logger.info(f"Cleared all sessions for user {user_id}")
    
    # ==================== Message Management ====================
    
    async def save_message(
        self,
        session_id: str,
        message: str,
        sender: str,
        user_id: Optional[int] = None,
        intent: Optional[str] = None,
        confidence: Optional[float] = None,
        metadata: Optional[Dict] = None,
    ) -> ChatMessage:
        """Save a chat message"""
        session = await self.get_session(session_id)
        if not session:
            session = await self.create_session(user_id)
            session_id = session.session_id
        else:
            session = await self.get_session(session_id)
        
        chat_message = ChatMessage(
            session_id=session.id,
            user_id=user_id,
            message=message,
            sender=sender,
            intent=intent,
            confidence=confidence,
            context_used=metadata or {},
            created_at=datetime.utcnow(),
        )
        
        self.db.add(chat_message)
        
        # Update message count
        session.message_count += 1
        session.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(chat_message)
        
        return chat_message
    
    async def get_session_messages(
        self,
        session_id: str,
        limit: int = 50,
    ) -> List[ChatMessage]:
        """Get all messages in a session"""
        session = await self.get_session(session_id)
        if not session:
            return []
        
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.asc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def delete_message(self, message_id: int, user_id: int) -> bool:
        """Delete a specific message"""
        result = await self.db.execute(
            select(ChatMessage).where(ChatMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if not message:
            return False
        
        # Check if user owns the session
        session = await self.get_session_by_id(message.session_id)
        if session and session.user_id != user_id:
            return False
        
        await self.db.delete(message)
        
        # Decrement message count
        if session:
            session.message_count = max(0, session.message_count - 1)
        
        await self.db.commit()
        
        return True
    
    async def get_session_by_id(self, session_id: int) -> Optional[ChatSession]:
        """Get session by database ID"""
        result = await self.db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        return result.scalar_one_or_none()
    
    # ==================== Feedback ====================
    
    async def save_feedback(
        self,
        message_id: int,
        user_id: int,
        helpful: bool,
        feedback_text: Optional[str] = None,
    ) -> bool:
        """Save feedback for a bot response"""
        result = await self.db.execute(
            select(ChatMessage).where(ChatMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if not message:
            return False
        
        # Check if user owns the session
        session = await self.get_session_by_id(message.session_id)
        if session and session.user_id != user_id:
            return False
        
        message.feedback_helpful = helpful
        message.feedback_text = feedback_text
        
        await self.db.commit()
        
        logger.info(f"Feedback saved for message {message_id}: helpful={helpful}")
        return True
    
    # ==================== Search ====================
    
    async def search_messages(
        self,
        user_id: int,
        query: str,
        limit: int = 20,
    ) -> List[ChatMessage]:
        """Search through user's chat messages"""
        result = await self.db.execute(
            select(ChatMessage)
            .join(ChatSession)
            .where(
                and_(
                    ChatSession.user_id == user_id,
                    ChatMessage.message.ilike(f"%{query}%")
                )
            )
            .order_by(desc(ChatMessage.created_at))
            .limit(limit)
        )
        return result.scalars().all()
    
    # ==================== Analytics ====================
    
    async def get_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get chatbot analytics"""
        query = select(ChatSession)
        
        if start_date:
            query = query.where(ChatSession.created_at >= start_date)
        if end_date:
            query = query.where(ChatSession.created_at <= end_date)
        
        # Total sessions
        sessions_result = await self.db.execute(query)
        sessions = sessions_result.scalars().all()
        total_sessions = len(sessions)
        
        # Total messages
        messages_result = await self.db.execute(
            select(ChatMessage).where(
                ChatMessage.created_at >= start_date if start_date else True,
                ChatMessage.created_at <= end_date if end_date else True,
            )
        )
        total_messages = len(messages_result.scalars().all())
        
        # Unique users
        users_result = await self.db.execute(
            select(ChatSession.user_id.distinct()).where(
                ChatSession.user_id.isnot(None)
            )
        )
        unique_users = len(users_result.scalars().all())
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "unique_users": unique_users,
            "avg_messages_per_session": round(total_messages / total_sessions, 2) if total_sessions > 0 else 0,
        }