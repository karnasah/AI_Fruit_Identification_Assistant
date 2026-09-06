"""
Authentication API Endpoints
Login, registration, token refresh, password reset
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import DBSession, OptionalCurrentUser, CurrentUser
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    verify_token,
)
from app.schemas.auth import (
    TokenResponse,
    LoginRequest,
    RegisterRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePasswordRequest,
    VerifyEmailRequest,
    MessageResponse,
    UserResponse,
)
from app.schemas.user import UserCreate, UserResponse as UserResponseSchema
from app.services.user_service import UserService
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponseSchema)
async def register(
    user_data: RegisterRequest,
    db: DBSession,
):
    """
    Register a new user
    """
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password (limit to 72 chars for bcrypt)
    password = user_data.password[:72]
    hashed_password = get_password_hash(password)
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        is_active=True,
        is_email_verified=False,
        created_at=datetime.utcnow(),
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"User registered: {user.email}")
    
    return UserResponseSchema(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: DBSession,
):
    """
    Login user and return access token
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == login_data.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact support.",
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponseSchema(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            is_email_verified=user.is_email_verified,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponseSchema)
async def get_current_user_info(
    current_user: CurrentUser,
):
    """
    Get current authenticated user information
    """
    return UserResponseSchema(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_email_verified=current_user.is_email_verified,
        created_at=current_user.created_at,
    )


# Add other endpoints as needed (forgot-password, reset-password, etc.)
# They can be added later