"""
Fruit Identification API Endpoints
Image upload, fruit identification, history, and favorites

Response contract (consumed by useFruitIdentification):
  success -> { "success": True, "data": <payload> }
  error   -> HTTPException (hook converts to { "success": False, "error": str })
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, OptionalCurrentUser
from app.schemas.fruit import (
    IdentificationResponse,
    IdentificationHistoryResponse,
    IdentificationDetailResponse,
    FruitInfoResponse,
    NutritionalInfoResponse,
    FavoriteResponse,
)
from app.schemas.auth import MessageResponse
from app.services.fruit_service import FruitService
from app.services.ml_service import MLService
from app.services.file_service import FileService
from app.utils.logger import logger

router = APIRouter(prefix="/fruits", tags=["Fruits"])

MAX_FILE_SIZE = 10 * 1024 * 1024


# ======================================== #
# Shared identification helper              #
# ======================================== #

async def _run_identification(temp_path: str, current_user, db: AsyncSession) -> dict:
    """
    Run ML inference, persist history, and return the response payload.

    The image is moved to permanent storage BEFORE the history row is
    written, so the DB never points at a deleted file.
    """
    logger.info("Identification image processed: path=%s", temp_path)
    ml_service = MLService()
    result = await ml_service.identify_fruit(temp_path)

    fruit_service = FruitService(db)
    fruit_info = await fruit_service.get_fruit_by_name(result["fruit_name"])
    file_service = FileService()

    image_url = None
    history_id = None

    if current_user:
        # Move temp -> permanent, then save the row that references it.
        image_url = await file_service.persist_image(temp_path, current_user.id)
        history = await fruit_service.save_identification_history(
            user_id=current_user.id,
            fruit_name=result["fruit_name"],
            confidence=result["confidence"],
            image_path=image_url,
            top_predictions=result.get("top_predictions", []),
            ripeness=result.get("ripeness"),
        )
        history_id = history.id
    else:
        # Anonymous user — nothing references the file, safe to delete.
        await file_service.delete_temp_file(temp_path)

    return {
        "id": history_id,
        "fruit_name": result["fruit_name"],
        "confidence": result["confidence"],
        "top_predictions": result.get("top_predictions", []),
        "ripeness": result.get("ripeness"),
        "nutritional_info": fruit_info.nutrition if fruit_info else None,
        "image_url": image_url,
    }


# ======================================== #
# Fruit Identification                      #
# ======================================== #

@router.post("/identify")
async def identify_fruit(
    image: UploadFile = File(...),
    current_user: OptionalCurrentUser = None,
    db: DBSession = None,
):
    logger.info(
        "Identification request received: filename=%s content_type=%s",
        image.filename,
        image.content_type,
    )
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image.",
        )

    file_service = FileService()
    file_size = await file_service.get_file_size(image)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB.",
        )

    temp_path = await file_service.save_temp_file(image)

    try:
        data = await _run_identification(temp_path, current_user, db)
        logger.info("Identification response returned: fruit=%s confidence=%.4f", data["fruit_name"], data["confidence"])
        return {"success": True, "data": data}
    except HTTPException:
        await file_service.delete_temp_file(temp_path)
        raise
    except Exception as e:
        logger.exception(f"Identification error: {e}")
        await file_service.delete_temp_file(temp_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Identification failed.",
        )


@router.post("/identify-base64")
async def identify_fruit_base64(
    image: str = Form(...),
    current_user: OptionalCurrentUser = None,
    db: DBSession = None,
):
    logger.info("Camera identification request: base64_chars=%d", len(image or ""))
    file_service = FileService()

    try:
        temp_path = await file_service.save_base64_image(image)
        logger.info("Camera image decoded: path=%s", temp_path)
    except Exception as exc:
        logger.error("Camera image decode failed: type=%s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid camera image data.",
        ) from exc

    try:
        data = await _run_identification(temp_path, current_user, db)
        return {"success": True, "data": data}
    except HTTPException:
        await file_service.delete_temp_file(temp_path)
        raise
    except Exception as e:
        logger.exception(f"Identification error: {e}")
        await file_service.delete_temp_file(temp_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Identification failed.",
        )


# ======================================== #
# Identification History                    #
# ======================================== #

@router.get("/history")
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
    Paginated history. `data.items` matches what HistoryTable consumes.
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

    return {
        "success": True,
        "data": {
            "items": [
                IdentificationHistoryResponse.model_validate(h).model_dump()
                for h in history
            ],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if limit else 0,
        },
    }


@router.get("/history/{history_id}")
async def get_identification_detail(
    history_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    service = FruitService(db)
    history = await service.get_identification_by_id(history_id, current_user.id)

    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identification record not found",
        )

    return {
        "success": True,
        "data": IdentificationDetailResponse.model_validate(history).model_dump(),
    }


@router.delete("/history/{history_id}")
async def delete_identification(
    history_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    service = FruitService(db)
    success = await service.delete_identification(history_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identification record not found",
        )

    return {"success": True, "data": {"message": "Identification record deleted"}}


@router.delete("/history")
async def clear_all_history(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    service = FruitService(db)
    await service.clear_all_history(current_user.id)
    return {"success": True, "data": {"message": "All history cleared"}}


# ======================================== #
# Fruit Information                         #
# ======================================== #

@router.get("/info/{fruit_name}")
async def get_fruit_info(fruit_name: str, db: DBSession = None):
    service = FruitService(db)
    fruit = await service.get_fruit_by_name(fruit_name)
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    return {
        "success": True,
        "data": FruitInfoResponse.model_validate(fruit).model_dump(),
    }


@router.get("/nutrition/{fruit_name}")
async def get_nutritional_info(fruit_name: str, db: DBSession = None):
    service = FruitService(db)
    fruit = await service.get_fruit_by_name(fruit_name)
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    nutrition = (
        NutritionalInfoResponse.model_validate(fruit.nutrition)
        if fruit.nutrition
        else NutritionalInfoResponse()
    )
    return {"success": True, "data": nutrition.model_dump()}


# ======================================== #
# Favorites                                 #
# ======================================== #

@router.get("/favorites")
async def get_favorites(current_user: CurrentUser = None, db: DBSession = None):
    service = FruitService(db)
    favorites = await service.get_user_favorites(current_user.id)
    return {
        "success": True,
        "data": [FavoriteResponse.model_validate(f).model_dump() for f in favorites],
    }


@router.post("/favorites")
async def add_favorite(
    fruit_name: str = Form(...),
    notes: Optional[str] = Form(None),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    fruit_service = FruitService(db)

    fruit = await fruit_service.get_fruit_by_name(fruit_name)
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )

    if await fruit_service.is_favorite(current_user.id, fruit.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fruit already in favorites",
        )

    favorite = await fruit_service.add_favorite(
        user_id=current_user.id,
        fruit_id=fruit.id,
        notes=notes,
    )
    return {
        "success": True,
        "data": FavoriteResponse.model_validate(favorite).model_dump(),
    }


@router.delete("/favorites/{favorite_id}")
async def remove_favorite(
    favorite_id: int,
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    service = FruitService(db)
    success = await service.remove_favorite(favorite_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    return {"success": True, "data": {"message": "Favorite removed"}}


# ======================================== #
# Statistics                                #
# ======================================== #

@router.get("/statistics")
async def get_identification_statistics(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Statistics consumed by `getIdentificationStats()` in the dashboard hook.

    Returns the same shape as `/dashboard/stats` so the frontend can use
    either endpoint interchangeably.
    """
    service = FruitService(db)

    try:
        stats = await service.get_user_statistics(current_user.id)
    except Exception as e:
        logger.exception(f"Statistics error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load statistics",
        )

    total = stats.get("total", 0)
    most_identified = stats.get("most_identified", []) or []

    # Convert snake_case payload into the camelCase keys the dashboard reads.
    most_identified_camel = [
        {
            "name": f.get("name"),
            "count": f.get("count", 0),
            "emoji": f.get("emoji", "🍎"),
            "percentage": f.get("percentage", 0),
        }
        for f in most_identified
    ]

    return {
        "success": True,
        "data": {
            # ---- read directly by DashboardPage ----
            "total": total,
            "mostIdentified": most_identified_camel,
            # ---- read by DashboardStats ----
            "total_identifications": total,
            "unique_fruits": stats.get("unique_fruits", 0),
            "success_rate": stats.get("success_rate", 0),
            "streak": stats.get("streak", 0),
            "active_days": stats.get("active_days", 0),
            "favorites_count": stats.get("favorites_count", 0),
            # ---- deltas (default to 0 until you compute vs. prior period) ----
            "total_identifications_change": 0,
            "unique_fruits_change": 0,
            "success_rate_change": 0,
            "streak_change": 0,
            # ---- keep snake_case too, for any legacy consumer ----
            "most_identified": most_identified_camel,
        },
    }