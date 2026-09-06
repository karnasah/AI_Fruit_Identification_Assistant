"""
User Service
Handles user profile management, settings, and account operations
"""

from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from sqlalchemy.orm import selectinload

from app.models.user import User, UserStatus, UserRole
from app.models.identification import Identification
from app.models.favorite import Favorite
from app.schemas.user import UserUpdate, UserSettingsUpdate
from app.core.security import get_password_hash
from app.utils.logger import logger


class UserService:
    """Service for user management operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role,
            is_active=True,
            created_at=datetime.utcnow(),
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"User created: {user.email}")
        
        return user
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_all_users(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[User], int]:
        """
        Get all users with pagination and filters
        
        Returns:
            Tuple of (users list, total count)
        """
        query = select(User)
        
        # Apply filters
        if search:
            query = query.where(
                User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
            )
        if role:
            query = query.where(User.role == role)
        if status:
            query = query.where(User.status == status)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        query = query.order_by(User.created_at.desc())
        
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        return list(users), total
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user profile"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"User updated: {user.email}")
        
        return user
    
    async def update_password(self, user_id: int, hashed_password: str) -> bool:
        """Update user password"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.hashed_password = hashed_password
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        return True
    
    async def update_last_login(self, user_id: int) -> None:
        """Update user's last login timestamp"""
        user = await self.get_user_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            await self.db.commit()
    
    async def soft_delete_user(self, user_id: int) -> bool:
        """Soft delete user (set status to inactive)"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.status = UserStatus.INACTIVE
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"User soft deleted: {user.email}")
        
        return True
    
    async def permanent_delete_user(self, user_id: int) -> bool:
        """Permanently delete user"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        await self.db.delete(user)
        await self.db.commit()
        
        logger.info(f"User permanently deleted: id={user_id}")
        
        return True
    
    async def ban_user(self, user_id: int, reason: str) -> bool:
        """Ban a user"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.status = UserStatus.BANNED
        user.is_banned = True
        user.ban_reason = reason
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"User banned: {user.email}, reason: {reason}")
        
        return True
    
    async def unban_user(self, user_id: int) -> bool:
        """Unban a user"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.status = UserStatus.ACTIVE
        user.is_banned = False
        user.ban_reason = None
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        logger.info(f"User unbanned: {user.email}")
        
        return True
    
    async def get_user_settings(self, user_id: int) -> Dict[str, Any]:
        """Get user preferences"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return {}
        
        return user.get_preferences
    
    async def update_user_settings(
        self, 
        user_id: int, 
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user preferences"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return {}
        
        current_settings = user.preferences or {}
        current_settings.update(settings)
        user.preferences = current_settings
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        return user.get_preferences
    
    async def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get user statistics"""
        # Get total identifications
        ident_result = await self.db.execute(
            select(func.count(Identification.id)).where(Identification.user_id == user_id)
        )
        total_identifications = ident_result.scalar_one() or 0
        
        # Get unique fruits identified
        unique_result = await self.db.execute(
            select(func.count(Identification.fruit_name.distinct())).where(
                Identification.user_id == user_id
            )
        )
        unique_fruits = unique_result.scalar_one() or 0
        
        # Get favorite fruits count
        fav_result = await self.db.execute(
            select(func.count(Favorite.id)).where(Favorite.user_id == user_id)
        )
        favorite_fruits = fav_result.scalar_one() or 0
        
        # Get success rate (identifications with confidence > 0.7)
        success_result = await self.db.execute(
            select(func.count(Identification.id)).where(
                and_(
                    Identification.user_id == user_id,
                    Identification.confidence >= 0.7
                )
            )
        )
        successful = success_result.scalar_one() or 0
        success_rate = (successful / total_identifications * 100) if total_identifications > 0 else 0
        
        # Get member days
        user = await self.get_user_by_id(user_id)
        member_days = (datetime.utcnow() - user.created_at).days if user else 0
        
        return {
            "total_identifications": total_identifications,
            "unique_fruits": unique_fruits,
            "favorite_fruits": favorite_fruits,
            "success_rate": round(success_rate, 1),
            "member_days": member_days,
        }
    
    async def deactivate_user(self, user_id: int) -> bool:
        """Deactivate user account"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.status = UserStatus.INACTIVE
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        return True
    
    async def reactivate_user(self, user_id: int) -> bool:
        """Reactivate user account"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            return False
        
        user.status = UserStatus.ACTIVE
        user.is_active = True
        user.updated_at = datetime.utcnow()
        
        await self.db.commit()
        
        return True
    
    async def verify_email(self, user_id: int) -> bool:
        """Verify user email"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        user.is_email_verified = True
        await self.db.commit()
        return True