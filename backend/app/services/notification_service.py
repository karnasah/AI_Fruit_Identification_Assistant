"""
Notification Service
Handles user notifications, push notifications, and email alerts
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.models.notification import Notification, NotificationPreference
from app.models.user import User
from app.utils.logger import logger


class NotificationService:
    """Service for notification operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ==================== User Notifications ====================
    
    async def send_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "info",
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Notification:
        """Send a notification to a user"""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            action_url=action_url,
            action_text=action_text,
            extra_data=metadata or {},
            created_at=datetime.utcnow(),
        )
        
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        
        logger.info(f"Notification sent to user {user_id}: {title}")
        return notification
    
    async def get_user_notifications(
        self,
        user_id: int,
        page: int = 1,
        limit: int = 20,
        unread_only: bool = False,
    ) -> Tuple[List[Notification], int]:
        """Get user's notifications"""
        query = select(Notification).where(Notification.user_id == user_id)
        
        if unread_only:
            query = query.where(Notification.is_read == False)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.order_by(desc(Notification.created_at))
        query = query.offset((page - 1) * limit).limit(limit)
        
        result = await self.db.execute(query)
        notifications = result.scalars().all()
        
        return list(notifications), total
    
    async def get_unread_count(self, user_id: int) -> int:
        """Get unread notifications count"""
        result = await self.db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        return result.scalar_one() or 0
    
    async def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark a notification as read"""
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        notification = result.scalar_one_or_none()
        
        if not notification:
            return False
        
        notification.mark_as_read()
        await self.db.commit()
        
        return True
    
    async def mark_all_as_read(self, user_id: int) -> None:
        """Mark all notifications as read"""
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        notifications = result.scalars().all()
        
        for notification in notifications:
            notification.mark_as_read()
        
        await self.db.commit()
        logger.info(f"All notifications marked as read for user {user_id}")
    
    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """Delete a notification"""
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        notification = result.scalar_one_or_none()
        
        if not notification:
            return False
        
        await self.db.delete(notification)
        await self.db.commit()
        
        return True
    
    async def delete_all_notifications(self, user_id: int) -> None:
        """Delete all notifications for a user"""
        result = await self.db.execute(
            select(Notification).where(Notification.user_id == user_id)
        )
        notifications = result.scalars().all()
        
        for notification in notifications:
            await self.db.delete(notification)
        
        await self.db.commit()
        logger.info(f"All notifications deleted for user {user_id}")
    
    async def send_notification_to_all(
        self,
        title: str,
        message: str,
        notification_type: str = "info",
        role: Optional[str] = None,
    ) -> int:
        """Send notification to all users (admin)"""
        query = select(User.id).where(User.is_active == True)
        
        if role:
            query = query.where(User.role == role)
        
        result = await self.db.execute(query)
        user_ids = result.scalars().all()
        
        count = 0
        for user_id in user_ids:
            await self.send_notification(user_id, title, message, notification_type)
            count += 1
        
        logger.info(f"Broadcast notification sent to {count} users")
        return count
    
    # ==================== Notification Preferences ====================
    
    async def get_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get user's notification preferences"""
        result = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        
        if prefs:
            return {
                "email_notifications": prefs.email_notifications,
                "email_digest_frequency": prefs.email_digest_frequency,
                "push_notifications": prefs.push_notifications,
                "identification_alerts": prefs.identification_alerts,
                "seasonal_alerts": prefs.seasonal_alerts,
                "achievement_alerts": prefs.achievement_alerts,
                "promotional_alerts": prefs.promotional_alerts,
            }
        
        # Return defaults
        return {
            "email_notifications": True,
            "email_digest_frequency": "daily",
            "push_notifications": False,
            "identification_alerts": True,
            "seasonal_alerts": True,
            "achievement_alerts": True,
            "promotional_alerts": False,
        }
    
    async def update_preferences(
        self,
        user_id: int,
        preferences: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Update user's notification preferences"""
        result = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        
        if not prefs:
            prefs = NotificationPreference(user_id=user_id)
            self.db.add(prefs)
        
        for key, value in preferences.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)
        
        prefs.updated_at = datetime.utcnow()
        await self.db.commit()
        
        return await self.get_preferences(user_id)
    
    async def save_push_subscription(self, user_id: int, subscription: Dict) -> None:
        """Save push notification subscription"""
        prefs = await self.get_or_create_preferences(user_id)
        prefs.push_subscription = subscription
        prefs.push_notifications = True
        await self.db.commit()
        
        logger.info(f"Push subscription saved for user {user_id}")
    
    async def remove_push_subscription(self, user_id: int) -> None:
        """Remove push notification subscription"""
        result = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        
        if prefs:
            prefs.push_subscription = None
            prefs.push_notifications = False
            await self.db.commit()
        
        logger.info(f"Push subscription removed for user {user_id}")
    
    async def get_or_create_preferences(self, user_id: int) -> NotificationPreference:
        """Get or create notification preferences for user"""
        result = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        
        if not prefs:
            prefs = NotificationPreference(user_id=user_id)
            self.db.add(prefs)
            await self.db.commit()
            await self.db.refresh(prefs)
        
        return prefs
    
    async def send_test_push(self, user_id: int) -> None:
        """Send test push notification"""
        await self.send_notification(
            user_id=user_id,
            title="🔔 Push Notification Test",
            message="You've successfully enabled push notifications!",
            notification_type="success",
        )
        logger.info(f"Test push notification sent to user {user_id}")
    
    async def generate_verification_token(self, user_id: int) -> str:
        """Generate email verification token"""
        # Placeholder - would generate actual token
        import uuid
        return str(uuid.uuid4())
    
    async def get_seasonal_alerts(self, user_id: int) -> List[Dict]:
        """Get seasonal fruit alerts for user"""
        # Placeholder - would fetch seasonal fruits based on current month
        return [
            {
                "fruit_name": "Mango",
                "season": "Summer",
                "message": "Mangoes are now in season!",
                "icon": "🥭",
            },
            {
                "fruit_name": "Watermelon",
                "season": "Summer",
                "message": "Watermelons are at their peak!",
                "icon": "🍉",
            },
        ]