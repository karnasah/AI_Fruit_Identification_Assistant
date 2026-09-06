"""
API Dependencies
Common dependencies for API routes (authentication, database sessions, etc.)
"""

from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_token
from app.models.user import User
from app.services.user_service import UserService


# Security scheme for Bearer token
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
    
    Returns:
        User object if authenticated, None otherwise
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    
    try:
        # Decode and verify token
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user_service = UserService(db)
        user = await user_service.get_user_by_id(int(user_id))
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        
        return user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user (must be authenticated)
    
    Args:
        current_user: User from get_current_user dependency
    
    Returns:
        User object
    
    Raises:
        HTTPException: If user is not authenticated
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current admin user (must have admin role)
    
    Args:
        current_user: User from get_current_active_user dependency
    
    Returns:
        User object
    
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_current_farmer_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current farmer user (must have farmer role)
    
    Args:
        current_user: User from get_current_active_user dependency
    
    Returns:
        User object
    
    Raises:
        HTTPException: If user is not a farmer
    """
    if current_user.role not in ["farmer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Farmer privileges required",
        )
    return current_user


async def get_current_vendor_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current vendor user (must have vendor role)
    
    Args:
        current_user: User from get_current_active_user dependency
    
    Returns:
        User object
    
    Raises:
        HTTPException: If user is not a vendor
    """
    if current_user.role not in ["vendor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vendor privileges required",
        )
    return current_user


# Type aliases for easier dependency injection
CurrentUser = Annotated[User, Depends(get_current_active_user)]
CurrentAdminUser = Annotated[User, Depends(get_current_admin_user)]
CurrentFarmerUser = Annotated[User, Depends(get_current_farmer_user)]
CurrentVendorUser = Annotated[User, Depends(get_current_vendor_user)]
OptionalCurrentUser = Annotated[Optional[User], Depends(get_current_user)]


async def get_db_session() -> AsyncSession:
    """
    Get database session dependency
    """
    async for session in get_db():
        yield session


DBSession = Annotated[AsyncSession, Depends(get_db_session)]