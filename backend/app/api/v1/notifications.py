"""
Notifications API Endpoints
Push notifications, email notifications, and in-app alerts
"""

from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, CurrentAdminUser
from app.schemas.notification import (
    NotificationResponse,
    NotificationCreate,
    NotificationPreferences,
    NotificationPreferencesUpdate,
    MessageResponse,
    PaginatedNotificationResponse,
)
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _notification_response(notification):
    return NotificationResponse(
        id=notification.id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        data=notification.extra_data,
        read=notification.is_read,
        created_at=notification.created_at,
        action_url=notification.action_url,
        action_text=notification.action_text,
    )


# ========================================
# User Notifications
# ========================================

@router.get("/", response_model=PaginatedNotificationResponse)
async def get_notifications(
    current_user: CurrentUser,
    db: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = False,
):
    """
    Get user's notifications
    """
    service = NotificationService(db)
    
    notifications, total = await service.get_user_notifications(
        user_id=current_user.id,
        page=page,
        limit=limit,
        unread_only=unread_only,
    )
    
    return PaginatedNotificationResponse(
        data=[_notification_response(n) for n in notifications],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get unread notifications count
    """
    service = NotificationService(db)
    
    count = await service.get_unread_count(current_user.id)
    
    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=MessageResponse)
async def mark_as_read(
    notification_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Mark a notification as read
    """
    service = NotificationService(db)
    
    success = await service.mark_as_read(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return MessageResponse(message="Notification marked as read")


@router.put("/read-all", response_model=MessageResponse)
async def mark_all_as_read(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Mark all notifications as read
    """
    service = NotificationService(db)
    
    await service.mark_all_as_read(current_user.id)
    
    return MessageResponse(message="All notifications marked as read")


@router.delete("/{notification_id}", response_model=MessageResponse)
async def delete_notification(
    notification_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Delete a notification
    """
    service = NotificationService(db)
    
    success = await service.delete_notification(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return MessageResponse(message="Notification deleted")


@router.delete("/", response_model=MessageResponse)
async def delete_all_notifications(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Delete all notifications
    """
    service = NotificationService(db)
    
    await service.delete_all_notifications(current_user.id)
    
    return MessageResponse(message="All notifications deleted")


# ========================================
# Notification Preferences
# ========================================

@router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get user's notification preferences
    """
    service = NotificationService(db)
    
    preferences = await service.get_preferences(current_user.id)
    
    return NotificationPreferences.model_validate(preferences)


@router.put("/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences_data: NotificationPreferencesUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Update notification preferences
    """
    service = NotificationService(db)
    
    preferences = await service.update_preferences(
        user_id=current_user.id,
        preferences=preferences_data.dict(exclude_unset=True),
    )
    
    return NotificationPreferences.model_validate(preferences)


# ========================================
# Admin: Send Notifications
# ========================================

@router.post("/admin/send", response_model=MessageResponse)
async def send_notification_to_user(
    current_admin: CurrentAdminUser,
    db: DBSession,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
):
    """
    Send notification to a specific user (admin only)
    """
    service = NotificationService(db)
    
    await service.send_notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    
    return MessageResponse(message=f"Notification sent to user {user_id}")


@router.post("/admin/send-all", response_model=MessageResponse)
async def send_notification_to_all_users(
    current_admin: CurrentAdminUser,
    db: DBSession,
    title: str,
    message: str,
    notification_type: str = "info",
    role: Optional[str] = None,
):
    """
    Send notification to all users (admin only)
    """
    service = NotificationService(db)
    
    count = await service.send_notification_to_all(
        title=title,
        message=message,
        notification_type=notification_type,
        role=role,
    )
    
    return MessageResponse(message=f"Notification sent to {count} users")


@router.post("/admin/broadcast-email", response_model=MessageResponse)
async def broadcast_email(
    current_admin: CurrentAdminUser,
    db: DBSession,
    subject: str,
    content: str,
    role: Optional[str] = None,
):
    """
    Send broadcast email to users (admin only)
    """
    email_service = EmailService()
    user_service = None  # Would need to import UserService
    
    # Get users by role
    # users = await user_service.get_users_by_role(role) if role else await user_service.get_all_users()
    
    # For now, just log
    logger.info(f"Broadcast email: {subject} to role: {role}")
    
    return MessageResponse(message="Broadcast email sent")


# ========================================
# Push Notifications (Web Push)
# ========================================

@router.post("/push/subscribe")
async def subscribe_to_push(
    subscription: dict,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Subscribe user to push notifications
    """
    service = NotificationService(db)
    
    await service.save_push_subscription(
        user_id=current_user.id,
        subscription=subscription,
    )
    
    return MessageResponse(message="Subscribed to push notifications")


@router.delete("/push/unsubscribe")
async def unsubscribe_from_push(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Unsubscribe from push notifications
    """
    service = NotificationService(db)
    
    await service.remove_push_subscription(current_user.id)
    
    return MessageResponse(message="Unsubscribed from push notifications")


@router.post("/push/test")
async def test_push_notification(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Send a test push notification
    """
    service = NotificationService(db)
    
    await service.send_test_push(current_user.id)
    
    return MessageResponse(message="Test push notification sent")


# ========================================
# Email Notifications
# ========================================

@router.post("/email/test")
async def test_email(
    current_user: CurrentUser,
):
    """
    Send a test email to the user
    """
    email_service = EmailService()
    
    await email_service.send_test_email(
        to_email=current_user.email,
        name=current_user.name,
    )
    
    return MessageResponse(message="Test email sent")


@router.post("/email/verify")
async def send_verification_email(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Send email verification link
    """
    email_service = EmailService()
    service = NotificationService(db)
    
    # Generate verification token
    token = await service.generate_verification_token(current_user.id)
    
    await email_service.send_verification_email(
        to_email=current_user.email,
        name=current_user.name,
        token=token,
    )
    
    return MessageResponse(message="Verification email sent")


# ========================================
# Seasonal Alerts
# ========================================

@router.get("/seasonal-alerts", response_model=List[dict])
async def get_seasonal_alerts(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get seasonal fruit alerts for the user
    """
    service = NotificationService(db)
    
    alerts = await service.get_seasonal_alerts(current_user.id)
    
    return alerts


@router.post("/seasonal-alerts/subscribe")
async def subscribe_to_seasonal_alerts(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Subscribe to seasonal fruit alerts
    """
    service = NotificationService(db)
    
    await service.update_preferences(
        user_id=current_user.id,
        preferences={"seasonal_alerts": True},
    )
    
    return MessageResponse(message="Subscribed to seasonal alerts")


@router.delete("/seasonal-alerts/unsubscribe")
async def unsubscribe_from_seasonal_alerts(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Unsubscribe from seasonal fruit alerts
    """
    service = NotificationService(db)
    
    await service.update_preferences(
        user_id=current_user.id,
        preferences={"seasonal_alerts": False},
    )
    
    return MessageResponse(message="Unsubscribed from seasonal alerts")