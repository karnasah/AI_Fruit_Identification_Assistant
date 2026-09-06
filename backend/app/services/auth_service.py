"""
Authentication Service
Handles user authentication, registration, token management, and password operations
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserStatus, UserRole
from app.schemas.auth import RegisterRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.core.config import settings
from app.utils.logger import logger


class AuthService:
    """Authentication service for user management"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def register_user(self, user_data: RegisterRequest) -> User:
        """
        Register a new user
        
        Args:
            user_data: User registration data
        
        Returns:
            Created user object
        """
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"New user registered: {user.email} (id: {user.id})")
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password
        
        Args:
            email: User email
            password: Plain text password
        
        Returns:
            User if authenticated, None otherwise
        """
        # Find user by email
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Check if user is active
        if user.status != UserStatus.ACTIVE:
            logger.warning(f"Login attempt on inactive account: {email}")
            return None
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        await self.db.commit()
        
        logger.info(f"User authenticated: {email}")
        
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    def create_tokens(self, user_id: int, role: str) -> Tuple[str, str]:
        """
        Create access and refresh tokens for user
        
        Args:
            user_id: User ID
            role: User role
        
        Returns:
            Tuple of (access_token, refresh_token)
        """
        token_data = {"sub": str(user_id), "role": role}
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return access_token, refresh_token
    
    async def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Refresh token string
        
        Returns:
            New access token or None if invalid
        """
        payload = verify_token(refresh_token, token_type="refresh")
        
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Verify user still exists and is active
        user = await self.get_user_by_id(int(user_id))
        if not user or user.status != UserStatus.ACTIVE:
            return None
        
        # Create new access token
        new_token = create_access_token({"sub": str(user_id), "role": user.role})
        
        return new_token
    
    async def change_password(
        self, 
        user_id: int, 
        current_password: str, 
        new_password: str
    ) -> bool:
        """
        Change user password
        
        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password
        
        Returns:
            True if successful, False otherwise
        """
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        # Verify current password
        if not verify_password(current_password, user.hashed_password):
            return False
        
        # Update password
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"Password changed for user: {user.email}")
        
        return True
    
    async def reset_password(self, email: str, new_password: str) -> bool:
        """
        Reset user password (for forgot password flow)
        
        Args:
            email: User email
            new_password: New password
        
        Returns:
            True if successful, False otherwise
        """
        user = await self.get_user_by_email(email)
        
        if not user:
            return False
        
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"Password reset for user: {email}")
        
        return True
    
    async def verify_email(self, user_id: int) -> bool:
        """
        Mark user email as verified
        
        Args:
            user_id: User ID
        
        Returns:
            True if successful, False otherwise
        """
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.is_email_verified = True
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"Email verified for user: {user.email}")
        
        return True
    
    async def update_last_active(self, user_id: int) -> None:
        """Update user's last active timestamp"""
        user = await self.get_user_by_id(user_id)
        if user:
            user.last_active = datetime.utcnow()
            await self.db.commit()
    
    async def logout_user(self, user_id: int) -> None:
        """Logout user (client should discard tokens)"""
        logger.info(f"User logged out: {user_id}")
        # No server-side token invalidation needed for JWT
        # Client should discard tokens