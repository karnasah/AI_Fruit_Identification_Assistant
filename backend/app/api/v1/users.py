"""
Users API Endpoints
User profile management, settings, and account operations
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserSettings,
    UserSettingsUpdate,
    UserStatsResponse,
    ChangePasswordRequest,
)
from app.schemas.auth import MessageResponse
from app.services.user_service import UserService
from app.services.file_service import FileService
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/users", tags=["Users"])


# ========================================
# Profile Management
# ========================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser,
):
    """
    Get current user profile
    """
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Update current user profile
    """
    service = UserService(db)
    
    # Check if email is being changed and if it's already taken
    if user_data.email and user_data.email != current_user.email:
        existing = await service.get_user_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken",
            )
    
    updated_user = await service.update_user(current_user.id, user_data)
    
    return UserResponse.model_validate(updated_user)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    current_user: CurrentUser,
    db: DBSession,
    avatar: UploadFile = File(...),
):
    """
    Upload user avatar image
    """
    # Validate file
    if not avatar.content_type or not avatar.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image.",
        )
    
    # Save avatar
    file_service = FileService()
    avatar_url = await file_service.save_avatar(avatar, current_user.id)
    
    # Update user
    service = UserService(db)
    updated_user = await service.update_user(current_user.id, {"avatar_url": avatar_url})
    
    return UserResponse.model_validate(updated_user)


@router.delete("/me/avatar", response_model=UserResponse)
async def delete_avatar(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Delete user avatar
    """
    service = UserService(db)
    updated_user = await service.update_user(current_user.id, {"avatar_url": None})
    
    return UserResponse.model_validate(updated_user)


# ========================================
# Password Management
# ========================================

@router.post("/me/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    # Update password
    service = UserService(db)
    hashed_password = get_password_hash(request.new_password)
    
    await service.update_password(current_user.id, hashed_password)
    
    return MessageResponse(message="Password changed successfully")


# ========================================
# Account Settings
# ========================================

@router.get("/me/settings", response_model=UserSettings)
async def get_user_settings(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get user settings
    """
    service = UserService(db)
    settings = await service.get_user_settings(current_user.id)
    
    return UserSettings.model_validate(settings)


@router.put("/me/settings", response_model=UserSettings)
async def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Update user settings
    """
    service = UserService(db)
    settings = await service.update_user_settings(
        user_id=current_user.id,
        settings=settings_data.dict(exclude_unset=True),
    )
    
    return UserSettings.model_validate(settings)


# ========================================
# User Statistics
# ========================================

@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get user statistics
    """
    service = UserService(db)
    
    stats = await service.get_user_stats(current_user.id)
    
    return UserStatsResponse.model_validate(stats)


# ========================================
# Account Management
# ========================================

@router.delete("/me", response_model=MessageResponse)
async def delete_account(
    current_user: CurrentUser,
    db: DBSession,
    password: str = Form(...),
):
    """
    Delete user account (requires password confirmation)
    """
    # Verify password
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )
    
    service = UserService(db)
    await service.soft_delete_user(current_user.id)
    
    return MessageResponse(message="Account deleted successfully")


@router.post("/me/deactivate", response_model=MessageResponse)
async def deactivate_account(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Deactivate user account (temporary)
    """
    service = UserService(db)
    await service.deactivate_user(current_user.id)
    
    return MessageResponse(message="Account deactivated successfully")


@router.post("/me/reactivate", response_model=MessageResponse)
async def reactivate_account(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Reactivate user account
    """
    service = UserService(db)
    await service.reactivate_user(current_user.id)
    
    return MessageResponse(message="Account reactivated successfully")


# ========================================
# User Activity
# ========================================

@router.get("/me/activity", response_model=dict)
async def get_user_activity(
    current_user: CurrentUser,
    db: DBSession,
    page: int = 1,
    limit: int = 20,
):
    """
    Get user activity log
    """
    service = UserService(db)
    
    activities, total = await service.get_user_activity(
        user_id=current_user.id,
        page=page,
        limit=limit,
    )
    
    return {
        "activities": activities,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


# ========================================
# Data Export
# ========================================

@router.post("/me/export-data", response_model=MessageResponse)
async def export_user_data(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Export user data (GDPR compliant)
    """
    service = UserService(db)
    
    export_url = await service.export_user_data(current_user.id)
    
    return MessageResponse(
        message="Data export started",
        data={"download_url": export_url},
    )


# ========================================
# Sessions Management
# ========================================

@router.get("/me/sessions", response_model=List[dict])
async def get_active_sessions(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get user's active sessions
    """
    service = UserService(db)
    
    sessions = await service.get_active_sessions(current_user.id)
    
    return sessions


@router.delete("/me/sessions/{session_id}", response_model=MessageResponse)
async def revoke_session(
    session_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Revoke a specific session
    """
    service = UserService(db)
    
    await service.revoke_session(current_user.id, session_id)
    
    return MessageResponse(message="Session revoked")


@router.delete("/me/sessions", response_model=MessageResponse)
async def revoke_all_sessions(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Revoke all other sessions (keep current)
    """
    service = UserService(db)
    
    await service.revoke_all_sessions(current_user.id)
    
    return MessageResponse(message="All other sessions revoked")