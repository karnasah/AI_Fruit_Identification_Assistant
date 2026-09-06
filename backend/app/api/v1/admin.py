"""
Admin API Endpoints
All admin-related endpoints (require admin role)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentAdminUser, DBSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.fruit import FruitCreate, FruitUpdate, FruitResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.user_service import UserService
from app.services.fruit_service import FruitService
from app.services.admin_service import AdminService
from app.services.ml_service import MLService
from app.utils.logger import logger

router = APIRouter(prefix="/admin", tags=["Admin"])


# ========================================
# User Management (Admin)
# ========================================

@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def get_all_users(
    current_admin: CurrentAdminUser,
    db: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    Get all users with pagination and filters
    """
    service = UserService(db)
    users, total = await service.get_all_users(
        page=page,
        limit=limit,
        search=search,
        role=role,
        status=status,
    )
    
    return PaginatedResponse(
        data=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Get user by ID
    """
    service = UserService(db)
    user = await service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse.model_validate(user)


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Create a new user (admin only)
    """
    service = UserService(db)
    
    # Check if email already exists
    existing = await service.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = await service.create_user(user_data)
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Update user by ID (admin only)
    """
    service = UserService(db)
    user = await service.update_user(user_id, user_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    current_admin: CurrentAdminUser,
    db: DBSession,
    user_id: int,
    permanent: bool = False,
):
    """
    Delete user (soft or permanent)
    """
    service = UserService(db)
    
    if permanent:
        success = await service.permanent_delete_user(user_id)
    else:
        success = await service.soft_delete_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return MessageResponse(message="User deleted successfully")


@router.post("/users/{user_id}/ban", response_model=MessageResponse)
async def ban_user(
    current_admin: CurrentAdminUser,
    db: DBSession,
    user_id: int,
    reason: str = Query(..., description="Ban reason"),
):
    """
    Ban a user
    """
    service = UserService(db)
    success = await service.ban_user(user_id, reason)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return MessageResponse(message="User banned successfully")


@router.post("/users/{user_id}/unban", response_model=MessageResponse)
async def unban_user(
    user_id: int,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Unban a user
    """
    service = UserService(db)
    success = await service.unban_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return MessageResponse(message="User unbanned successfully")


# ========================================
# Fruit Database Management (Admin)
# ========================================

@router.get("/fruits", response_model=PaginatedResponse[FruitResponse])
async def get_all_fruits_admin(
    current_admin: CurrentAdminUser,
    db: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
):
    """
    Get all fruits with pagination (admin view)
    """
    service = FruitService(db)
    fruits, total = await service.get_all_fruits(
        page=page,
        limit=limit,
        search=search,
        category=category,
    )
    
    return PaginatedResponse(
        data=[FruitResponse.model_validate(f) for f in fruits],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.post("/fruits", response_model=FruitResponse)
async def add_fruit(
    fruit_data: FruitCreate,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Add a new fruit to encyclopedia
    """
    service = FruitService(db)
    
    # Check if fruit already exists
    existing = await service.get_fruit_by_name(fruit_data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fruit already exists",
        )
    
    fruit = await service.create_fruit(fruit_data)
    return FruitResponse.model_validate(fruit)


@router.put("/fruits/{fruit_id}", response_model=FruitResponse)
async def update_fruit(
    fruit_id: int,
    fruit_data: FruitUpdate,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Update fruit information
    """
    service = FruitService(db)
    fruit = await service.update_fruit(fruit_id, fruit_data)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fruit not found",
        )
    
    return FruitResponse.model_validate(fruit)


@router.delete("/fruits/{fruit_id}", response_model=MessageResponse)
async def delete_fruit(
    fruit_id: int,
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Delete fruit from encyclopedia
    """
    service = FruitService(db)
    success = await service.delete_fruit(fruit_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fruit not found",
        )
    
    return MessageResponse(message="Fruit deleted successfully")


# ========================================
# ML Model Management (Admin)
# ========================================

@router.get("/models")
async def get_models(
    current_admin: CurrentAdminUser,
):
    """
    Get all ML models information
    """
    ml_service = MLService()
    models = await ml_service.get_models()
    return {"models": models}


@router.post("/models/activate/{model_id}")
async def activate_model(
    model_id: str,
    current_admin: CurrentAdminUser,
):
    """
    Activate a specific ML model
    """
    ml_service = MLService()
    success = await ml_service.activate_model(model_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    
    return MessageResponse(message=f"Model {model_id} activated successfully")


@router.post("/models/train")
async def train_model(
    current_admin: CurrentAdminUser,
):
    """
    Start model training job
    """
    admin_service = AdminService()
    job_id = await admin_service.start_training_job()
    
    return {
        "message": "Training job started",
        "job_id": job_id,
        "status_url": f"/api/v1/admin/models/train/{job_id}/status",
    }


@router.get("/models/train/{job_id}/status")
async def get_training_status(
    job_id: str,
    current_admin: CurrentAdminUser,
):
    """
    Get training job status
    """
    admin_service = AdminService()
    status = await admin_service.get_training_status(job_id)
    
    return status


# ========================================
# System Analytics (Admin)
# ========================================

@router.get("/analytics/overview")
async def get_system_overview(
    current_admin: CurrentAdminUser,
    db: DBSession,
):
    """
    Get system overview statistics
    """
    admin_service = AdminService(db)
    stats = await admin_service.get_system_overview()
    return stats


@router.get("/analytics/users")
async def get_user_analytics(
    current_admin: CurrentAdminUser,
    db: DBSession,
    period: str = Query("week", pattern="^(day|week|month|year)$"),
):
    """
    Get user growth analytics
    """
    admin_service = AdminService(db)
    analytics = await admin_service.get_user_analytics(period)
    return analytics


@router.get("/analytics/identifications")
async def get_identification_analytics(
    current_admin: CurrentAdminUser,
    db: DBSession,
    period: str = Query("week", pattern="^(day|week|month|year)$"),
):
    """
    Get identification analytics
    """
    admin_service = AdminService(db)
    analytics = await admin_service.get_identification_analytics(period)
    return analytics


# ========================================
# System Health (Admin)
# ========================================

@router.get("/system/health")
async def get_system_health(
    current_admin: CurrentAdminUser,
):
    """
    Get system health status
    """
    admin_service = AdminService()
    health = await admin_service.get_system_health()
    return health


@router.post("/system/clear-cache")
async def clear_cache(
    current_admin: CurrentAdminUser,
):
    """
    Clear system cache
    """
    admin_service = AdminService()
    await admin_service.clear_cache()
    return MessageResponse(message="Cache cleared successfully")


@router.post("/system/maintenance")
async def set_maintenance_mode(
    current_admin: CurrentAdminUser,
    enabled: bool,
    message: Optional[str] = None,
):
    """
    Enable/disable maintenance mode
    """
    admin_service = AdminService()
    await admin_service.set_maintenance_mode(enabled, message)
    
    status = "enabled" if enabled else "disabled"
    return MessageResponse(message=f"Maintenance mode {status}")