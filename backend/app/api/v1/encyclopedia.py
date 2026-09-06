"""
Encyclopedia API Endpoints
Fruit database, search, filters, and detailed information
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Query

from app.api.deps import DBSession, CurrentUser, OptionalCurrentUser
from app.schemas.fruit import (
    FruitDetailResponse,
    FruitCategoryResponse,
    FruitSeasonResponse,
    FruitNutritionResponse,
    FruitCompareResponse,
    FruitSearchResponse,
    FruitListItemResponse,
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.encyclopedia_service import EncyclopediaService
from app.services.fruit_service import FruitService

router = APIRouter(prefix="/encyclopedia", tags=["Encyclopedia"])


# ========================================
# Fruit Listing & Search
# ========================================

@router.get("/fruits", response_model=PaginatedResponse[FruitListItemResponse])
async def get_all_fruits(
    current_user: OptionalCurrentUser,
    db: DBSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    season: Optional[str] = None,
    nutrition: Optional[str] = None,
    sort: Optional[str] = Query("name", pattern=r"^(name|calories|popularity|season)$"),
    order: Optional[str] = Query("asc", pattern=r"^(asc|desc)$"),
):
    """
    Get all fruits with pagination and filters
    """
    service = EncyclopediaService(db)
    
    fruits, total = await service.get_all_fruits(
        page=page,
        limit=limit,
        search=search,
        category=category,
        season=season,
        nutrition=nutrition,
        sort=sort,
        order=order,
    )
    
    return PaginatedResponse(
        data=[FruitListItemResponse.model_validate(f) for f in fruits],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/fruits/{fruit_name}", response_model=FruitDetailResponse)
async def get_fruit_details(
    fruit_name: str,
    current_user: OptionalCurrentUser,
    db: DBSession,
):
    """
    Get detailed information about a specific fruit
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    # Check if fruit is in user's favorites
    is_favorite = False
    if current_user:
        fav_service = FruitService(db)
        is_favorite = await fav_service.is_favorite(current_user.id, fruit.id)
    
    response = FruitDetailResponse.model_validate(fruit)
    response.is_favorite = is_favorite
    
    return response


@router.get("/fruits/id/{fruit_id}", response_model=FruitDetailResponse)
async def get_fruit_by_id(
    fruit_id: int,
    current_user: OptionalCurrentUser,
    db: DBSession,
):
    """
    Get detailed information about a specific fruit by ID
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_id(fruit_id)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fruit not found",
        )
    
    # Check if fruit is in user's favorites
    is_favorite = False
    if current_user:
        fav_service = FruitService(db)
        is_favorite = await fav_service.is_favorite(current_user.id, fruit.id)
    
    response = FruitDetailResponse.model_validate(fruit)
    response.is_favorite = is_favorite
    
    return response


@router.get("/search", response_model=FruitSearchResponse)
async def search_fruits(
    db: DBSession,
    q: str = Query(..., min_length=2, max_length=50),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Search fruits by name or description
    """
    service = EncyclopediaService(db)
    
    results = await service.search_fruits(q, limit)
    
    return FruitSearchResponse(
        query=q,
        results=[FruitListItemResponse.model_validate(r) for r in results],
        total=len(results),
    )


# ========================================
# Categories & Seasons
# ========================================

@router.get("/categories", response_model=List[FruitCategoryResponse])
async def get_categories(
    db: DBSession,
):
    """
    Get all fruit categories
    """
    service = EncyclopediaService(db)
    
    categories = await service.get_categories()
    
    return [
        FruitCategoryResponse(
            id=c["id"],
            name=c["name"],
            icon=c.get("icon"),
            color=c.get("color"),
            fruit_count=c.get("fruit_count", 0),
        )
        for c in categories
    ]


@router.get("/categories/{category_name}", response_model=PaginatedResponse[FruitListItemResponse])
async def get_fruits_by_category(
    db: DBSession,
    category_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get fruits by category
    """
    service = EncyclopediaService(db)
    
    fruits, total = await service.get_fruits_by_category(
        category_name=category_name,
        page=page,
        limit=limit,
    )
    
    return PaginatedResponse(
        data=[FruitListItemResponse.model_validate(f) for f in fruits],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/seasons", response_model=List[FruitSeasonResponse])
async def get_seasons(
    db: DBSession,
):
    """
    Get all seasons with fruit counts
    """
    service = EncyclopediaService(db)
    
    seasons = await service.get_seasons()
    
    return [
        FruitSeasonResponse(
            name=s["name"],
            icon=s.get("icon"),
            months=s.get("months", []),
            fruit_count=s.get("fruit_count", 0),
        )
        for s in seasons
    ]


@router.get("/seasons/{season_name}", response_model=PaginatedResponse[FruitListItemResponse])
async def get_fruits_by_season(
    db: DBSession,
    season_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get fruits by season
    """
    service = EncyclopediaService(db)
    
    fruits, total = await service.get_fruits_by_season(
        season_name=season_name,
        page=page,
        limit=limit,
    )
    
    return PaginatedResponse(
        data=[FruitListItemResponse.model_validate(f) for f in fruits],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/seasonal/current", response_model=List[FruitListItemResponse])
async def get_current_season_fruits(
    db: DBSession,
    limit: int = Query(10, ge=1, le=50),
):
    """
    Get fruits that are currently in season
    """
    service = EncyclopediaService(db)
    
    fruits = await service.get_current_season_fruits(limit)
    
    return [FruitListItemResponse.model_validate(f) for f in fruits]


@router.get("/seasonal/month/{month}", response_model=List[FruitListItemResponse])
async def get_fruits_by_month(
    db: DBSession,
    month: int,
    limit: int = Query(20, ge=1, le=50),
):
    """
    Get fruits in season for a specific month
    """
    service = EncyclopediaService(db)
    
    fruits = await service.get_fruits_by_month(month, limit)
    
    return [FruitListItemResponse.model_validate(f) for f in fruits]


# ========================================
# Nutrition & Health
# ========================================

@router.get("/nutrition/{fruit_name}", response_model=FruitNutritionResponse)
async def get_nutritional_info(
    fruit_name: str,
    db: DBSession,
):
    """
    Get detailed nutritional information for a fruit
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return FruitNutritionResponse.model_validate(fruit.nutrition) if fruit.nutrition else FruitNutritionResponse()


@router.get("/top-nutrients/{nutrient}", response_model=List[dict])
async def get_top_nutrient_fruits(
    db: DBSession,
    nutrient: str,
    limit: int = Query(10, ge=1, le=50),
):
    """
    Get top fruits for a specific nutrient
    """
    service = EncyclopediaService(db)
    
    fruits = await service.get_top_nutrient_fruits(nutrient, limit)
    
    return fruits


@router.get("/health-benefits", response_model=List[str])
async def get_health_benefits(
    db: DBSession,
):
    """
    Get list of all health benefits
    """
    service = EncyclopediaService(db)
    
    benefits = await service.get_health_benefits()
    
    return benefits


@router.get("/health-benefits/{benefit}", response_model=List[FruitListItemResponse])
async def get_fruits_by_health_benefit(
    db: DBSession,
    benefit: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get fruits by health benefit
    """
    service = EncyclopediaService(db)
    
    fruits, total = await service.get_fruits_by_health_benefit(
        benefit=benefit,
        page=page,
        limit=limit,
    )
    
    return [FruitListItemResponse.model_validate(f) for f in fruits]


# ========================================
# Compare & Recommendations
# ========================================

@router.get("/compare/{fruit1}/{fruit2}", response_model=FruitCompareResponse)
async def compare_fruits(
    fruit1: str,
    fruit2: str,
    db: DBSession,
):
    """
    Compare two fruits side by side
    """
    service = EncyclopediaService(db)
    
    f1 = await service.get_fruit_by_name(fruit1)
    f2 = await service.get_fruit_by_name(fruit2)
    
    if not f1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit1}' not found",
        )
    
    if not f2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit2}' not found",
        )
    
    comparison = await service.compare_fruits(f1, f2)
    
    return FruitCompareResponse(
        fruit1=FruitDetailResponse.model_validate(f1),
        fruit2=FruitDetailResponse.model_validate(f2),
        comparison=comparison,
        winner=comparison.get("winner"),
    )


@router.get("/fruit-of-the-day", response_model=FruitDetailResponse)
async def get_fruit_of_the_day(
    db: DBSession,
):
    """
    Get random fruit of the day
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_of_the_day()
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No fruits found",
        )
    
    return FruitDetailResponse.model_validate(fruit)


@router.get("/recommendations", response_model=List[FruitListItemResponse])
async def get_recommended_fruits(
    current_user: CurrentUser,
    db: DBSession,
    limit: int = Query(10, ge=1, le=20),
):
    """
    Get fruit recommendations based on user history
    """
    service = EncyclopediaService(db)
    
    recommendations = await service.get_recommendations(
        user_id=current_user.id,
        limit=limit,
    )
    
    return [FruitListItemResponse.model_validate(r) for r in recommendations]


@router.get("/trending", response_model=List[FruitListItemResponse])
async def get_trending_fruits(
    db: DBSession,
    limit: int = Query(10, ge=1, le=20),
):
    """
    Get trending/popular fruits
    """
    service = EncyclopediaService(db)
    
    trending = await service.get_trending_fruits(limit)
    
    return [FruitListItemResponse.model_validate(f) for f in trending]


# ========================================
# Fruit Images & Facts
# ========================================

@router.get("/images/{fruit_name}", response_model=List[str])
async def get_fruit_images(
    fruit_name: str,
    db: DBSession,
):
    """
    Get fruit images gallery
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return fruit.images or []


@router.get("/fun-facts/{fruit_name}", response_model=List[str])
async def get_fun_facts(
    db: DBSession,
    fruit_name: str,
    limit: int = Query(5, ge=1, le=10),
):
    """
    Get fun facts about a fruit
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return fruit.fun_facts[:limit] if fruit.fun_facts else []


@router.get("/growing-tips/{fruit_name}", response_model=dict)
async def get_growing_tips(
    fruit_name: str,
    db: DBSession,
):
    """
    Get fruit growing tips and farming information
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return fruit.growing_tips or {}


@router.get("/storage/{fruit_name}", response_model=dict)
async def get_storage_guide(
    fruit_name: str,
    db: DBSession,
):
    """
    Get fruit storage guidelines
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return fruit.storage_info or {}


@router.get("/varieties/{fruit_name}", response_model=List[dict])
async def get_fruit_varieties(
    fruit_name: str,
    db: DBSession,
):
    """
    Get fruit varieties and cultivars
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    return fruit.varieties or []


@router.get("/origin/{country}", response_model=List[FruitListItemResponse])
async def get_fruits_by_origin(
    db: DBSession,
    country: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get fruits by origin country
    """
    service = EncyclopediaService(db)
    
    fruits, total = await service.get_fruits_by_origin(
        country=country,
        page=page,
        limit=limit,
    )
    
    return [FruitListItemResponse.model_validate(f) for f in fruits]


# ========================================
# Favorites (Authenticated)
# ========================================

@router.get("/favorites", response_model=List[FruitListItemResponse])
async def get_favorites(
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get user's favorite fruits
    """
    service = FruitService(db)
    
    favorites = await service.get_user_favorites(current_user.id)
    
    return [FruitListItemResponse.model_validate(f.fruit) for f in favorites]


@router.post("/favorites/{fruit_id}", response_model=MessageResponse)
async def add_to_favorites(
    fruit_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Add fruit to user's favorites
    """
    service = FruitService(db)
    
    # Check if fruit exists
    fruit_service = EncyclopediaService(db)
    fruit = await fruit_service.get_fruit_by_id(fruit_id)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fruit not found",
        )
    
    # Check if already favorited
    is_favorite = await service.is_favorite(current_user.id, fruit_id)
    
    if is_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fruit already in favorites",
        )
    
    await service.add_to_favorites(current_user.id, fruit_id)
    
    return MessageResponse(message="Fruit added to favorites")


@router.delete("/favorites/{fruit_id}", response_model=MessageResponse)
async def remove_from_favorites(
    fruit_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Remove fruit from user's favorites
    """
    service = FruitService(db)
    
    success = await service.remove_from_favorites(current_user.id, fruit_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fruit not found in favorites",
        )
    
    return MessageResponse(message="Fruit removed from favorites")


@router.get("/favorites/check/{fruit_id}", response_model=dict)
async def check_favorite(
    fruit_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Check if fruit is in user's favorites
    """
    service = FruitService(db)
    
    is_favorite = await service.is_favorite(current_user.id, fruit_id)
    
    return {"is_favorite": is_favorite}


# ========================================
# Statistics & Download
# ========================================

@router.get("/statistics", response_model=dict)
async def get_encyclopedia_statistics(
    db: DBSession,
):
    """
    Get encyclopedia statistics
    """
    service = EncyclopediaService(db)
    
    stats = await service.get_statistics()
    
    return stats


@router.get("/download/{fruit_name}", response_model=MessageResponse)
async def download_fruit_info(
    fruit_name: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Download fruit information as PDF
    """
    service = EncyclopediaService(db)
    
    fruit = await service.get_fruit_by_name(fruit_name)
    
    if not fruit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit '{fruit_name}' not found",
        )
    
    download_url = await service.generate_pdf(fruit, current_user.id)
    
    return MessageResponse(
        message="PDF generated successfully",
        data={"download_url": download_url},
    )