"""
Fruit Identification API Endpoints
Image upload, fruit identification, history, and favorites
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, OptionalCurrentUser
from app.schemas.fruit import (
    IdentificationResponse,
    IdentificationHistoryResponse,
    IdentificationDetailResponse,
    FruitInfoResponse,
    NutritionalInfoResponse,
    FavoriteResponse,
    BatchIdentificationResponse,
)
from app.schemas.auth import MessageResponse
from app.schemas.common import PaginatedResponse
from app.services.fruit_service import FruitService
from app.services.ml_service import MLService
from app.services.file_service import FileService
from app.utils.logger import logger

router = APIRouter(prefix="/fruits", tags=["Fruits"])


# ========================================
# Fruit Identification
# ========================================

@router.post("/identify", response_model=IdentificationResponse)
async def identify_fruit(
    image: UploadFile = File(...),
    current_user: OptionalCurrentUser = None,
    db: DBSession = None,
):
    """
    Identify a fruit from uploaded image
    """
    # Validate file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image.",
        )
    
    # Check file size (max 10MB)
    file_service = FileService()
    file_size = await file_service.get_file_size(image)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB.",
        )
    
    # Save uploaded file temporarily
    temp_path = await file_service.save_temp_file(image)
    
    try:
        # Run ML inference
        ml_service = MLService()
        result = await ml_service.identify_fruit(temp_path)
        
        # Get fruit details from database
        fruit_service = FruitService(db)
        fruit_info = await fruit_service.get_fruit_by_name(result["fruit_name"])
        
        # Save to history if user is authenticated
        history_id = None
        if current_user:
            history = await fruit_service.save_identification_history(
                user_id=current_user.id,
                fruit_name=result["fruit_name"],
                confidence=result["confidence"],
                image_path=temp_path,
                top_predictions=result.get("top_predictions", []),
                ripeness=result.get("ripeness"),
            )
            history_id = history.id
        
        # Clean up temp file
        await file_service.delete_temp_file(temp_path)
        
        return IdentificationResponse(
            id=history_id,
            fruit_name=result["fruit_name"],
            confidence=result["confidence"],
            top_predictions=result.get("top_predictions", []),
            ripeness=result.get("ripeness"),
            nutritional_info=fruit_info.nutrition if fruit_info else None,
            image_url=None,
        )
        
    except Exception as e:
        logger.error(f"Identification error: {e}")
        await file_service.delete_temp_file(temp_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Identification failed: {str(e)}",
        )


@router.post("/identify-base64", response_model=IdentificationResponse)
async def identify_fruit_base64(
    image: str = Form(...),
    current_user: OptionalCurrentUser = None,
    db: DBSession = None,
):
    """
    Identify a fruit from base64 encoded image (for camera capture)
    """
    file_service = FileService()
    temp_path = await file_service.save_base64_image(image)
    
    try:
        ml_service = MLService()
        result = await ml_service.identify_fruit(temp_path)
        
        fruit_service = FruitService(db)
        fruit_info = await fruit_service.get_fruit_by_name(result["fruit_name"])
        
        history_id = None
        if current_user:
            history = await fruit_service.save_identification_history(
                user_id=current_user.id,
                fruit_name=result["fruit_name"],
                confidence=result["confidence"],
                image_path=temp_path,
                top_predictions=result.get("top_predictions", []),
                ripeness=result.get("ripeness"),
            )
            history_id = history.id
        
        await file_service.delete_temp_file(temp_path)
        
        return IdentificationResponse(
            id=history_id,
            fruit_name=result["fruit_name"],
            confidence=result["confidence"],
            top_predictions=result.get("top_predictions", []),
            ripeness=result.get("ripeness"),
            nutritional_info=fruit_info.nutrition if fruit_info else None,
            image_url=None,
        )
        
    except Exception as e:
        logger.error(f"Identification error: {e}")
        await file_service.delete_temp_file(temp_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Identification failed: {str(e)}",
        )


# ========================================
# Identification History
# ========================================

@router.get("/history", response_model=PaginatedResponse[IdentificationHistoryResponse])
async def get_identification_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    fruit: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get user's identification history
    """
    service = FruitService(db)
    
    history, total = await service.get_user_history(
        user_id=current_user.id,
        page=page,
        limit=limit,
        fruit_name=fruit,
        date_from=date_from,
        date_to=date_to,
    )
    
    return PaginatedResponse(
        data=[IdentificationHistoryResponse.model_validate(h) for h in history],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/history/{history_id}", response_model=IdentificationDetailResponse)
async def get_identification_detail(
    history_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get detailed information about a specific identification
    """
    service = FruitService(db)
    history = await service.get_identification_by_id(history_id, current_user.id)
    
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identification record not found",
        )
    
    return IdentificationDetailResponse.model_validate(history)


@router.delete("/history/{history_id}", response_model=MessageResponse)
async def delete_identification(
    history_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Delete an identification history record
    """
    service = FruitService(db)
    success = await service.delete_identification(history_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identification record not found",
        )
    
    return MessageResponse(message="Identification record deleted")


@router.delete("/history", response_model=MessageResponse)
async def clear_all_history(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Clear all identification history for the user
    """
    service = FruitService(db)
    await service.clear_all_history(current_user.id)
    return MessageResponse(message="All history cleared")


# ========================================
# Fruit Information
# ========================================

@router.get("/info/{fruit_name}", response_model=FruitInfoResponse)
async def get_fruit_info(
    fruit_name: str,
    db: DBSession = None,
):
    """Get detailed information about a fruit"""
    service = FruitService(db)
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return FruitInfoResponse.model_validate(fruit)


@router.get("/nutrition/{fruit_name}", response_model=NutritionalInfoResponse)
async def get_nutritional_info(
    fruit_name: str,
    db: DBSession = None,
):
    """Get nutritional information for a fruit"""
    service = FruitService(db)
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return NutritionalInfoResponse.model_validate(fruit.nutrition) if fruit.nutrition else NutritionalInfoResponse()


# ========================================
# Favorites
# ========================================

@router.get("/favorites", response_model=List[FavoriteResponse])
async def get_favorites(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Get user's favorite fruits"""
    service = FruitService(db)
    favorites = await service.get_user_favorites(current_user.id)
    return [FavoriteResponse.model_validate(f) for f in favorites]


@router.post("/favorites", response_model=FavoriteResponse)
async def add_favorite(
    fruit_name: str = Form(...),
    notes: Optional[str] = Form(None),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Add a fruit to user's favorites"""
    fruit_service = FruitService(db)
    
    fruit = await fruit_service.get_fruit_by_name(fruit_name)
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    existing = await fruit_service.is_favorite(current_user.id, fruit.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fruit already in favorites",
        )
    
    favorite = await fruit_service.add_favorite(
        user_id=current_user.id,
        fruit_id=fruit.id,
        notes=notes,
    )
    
    return FavoriteResponse.model_validate(favorite)


@router.delete("/favorites/{favorite_id}", response_model=MessageResponse)
async def remove_favorite(
    favorite_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Remove a fruit from user's favorites"""
    service = FruitService(db)
    success = await service.remove_favorite(favorite_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    
    return MessageResponse(message="Favorite removed")


# ========================================
# Statistics
# ========================================

@router.get("/statistics", response_model=dict)
async def get_identification_statistics(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Get user's identification statistics"""
    service = FruitService(db)
    stats = await service.get_user_statistics(current_user.id)
    
    return {
        "total": stats.get("total", 0),
        "unique_fruits": stats.get("unique_fruits", 0),
        "success_rate": stats.get("success_rate", 0),
        "most_identified": stats.get("most_identified", []),
    }