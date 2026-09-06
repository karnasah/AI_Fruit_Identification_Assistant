from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FruitBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., min_length=1, max_length=100)
    scientific_name: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=50)
    emoji: Optional[str] = Field(None, max_length=10)
    image_url: Optional[str] = None
    images: Optional[List[str]] = []
    nutrition: Optional[Dict[str, Any]] = None
    season: Optional[str] = None
    peak_months: Optional[List[int]] = []
    benefits: Optional[List[str]] = []
    storage_tips: Optional[str] = None
    growing_tips: Optional[Dict[str, Any]] = None
    recipes: Optional[List[Dict[str, Any]]] = []
    fun_facts: Optional[List[str]] = []
    origin_countries: Optional[List[str]] = []
    price_info: Optional[Dict[str, Any]] = None


class FruitCreate(FruitBase):
    pass


class FruitUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    scientific_name: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=50)
    emoji: Optional[str] = Field(None, max_length=10)
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    nutrition: Optional[Dict[str, Any]] = None
    season: Optional[str] = None
    peak_months: Optional[List[int]] = None
    benefits: Optional[List[str]] = None
    storage_tips: Optional[str] = None
    growing_tips: Optional[Dict[str, Any]] = None
    recipes: Optional[List[Dict[str, Any]]] = None
    fun_facts: Optional[List[str]] = None
    origin_countries: Optional[List[str]] = None
    price_info: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class FruitResponse(FruitBase):
    id: int
    popularity: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class FruitListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    category: Optional[str] = None
    emoji: Optional[str] = None
    image_url: Optional[str] = None
    season: Optional[str] = None
    calories: Optional[int] = None


class FruitDetailResponse(FruitResponse):
    is_favorite: bool = False
    identification_count: int = 0


class FruitInfoResponse(FruitResponse):
    pass


class FruitCategoryResponse(BaseModel):
    """Fruit category response"""
    id: int
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    fruit_count: int = 0


class FruitSeasonResponse(BaseModel):
    """Fruit season response"""
    name: str
    icon: Optional[str] = None
    months: List[int]
    fruit_count: int = 0


class FruitNutritionResponse(BaseModel):
    calories: int = 0
    carbs: str = "0g"
    protein: str = "0g"
    fat: str = "0g"
    fiber: str = "0g"
    vitamin_c: str = "0mg"
    vitamin_a: str = "0IU"
    potassium: str = "0mg"


class NutritionalInfoResponse(BaseModel):
    calories: int = 0
    calories_from_fat: int = 0
    total_fat: str = "0g"
    saturated_fat: str = "0g"
    cholesterol: str = "0mg"
    sodium: str = "0mg"
    total_carbohydrates: str = "0g"
    dietary_fiber: str = "0g"
    sugars: str = "0g"
    protein: str = "0g"
    vitamin_a: str = "0%"
    vitamin_c: str = "0%"
    calcium: str = "0%"
    iron: str = "0%"
    potassium: str = "0mg"


class FruitCompareResponse(BaseModel):
    fruit1: FruitDetailResponse
    fruit2: FruitDetailResponse
    comparison: Dict[str, Any]
    winner: Optional[str] = None


class FruitSearchResponse(BaseModel):
    query: str
    results: List[FruitListItemResponse] = []
    total: int = 0


class IdentificationResult(BaseModel):
    fruit_name: str
    confidence: float
    top_predictions: List[Dict[str, Any]] = []
    ripeness: Optional[str] = None
    ripeness_confidence: Optional[float] = None
    disease: Optional[str] = None
    disease_confidence: Optional[float] = None
    bounding_box: Optional[Dict[str, Any]] = None


class IdentificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: Optional[int] = None
    fruit_name: str
    confidence: float
    top_predictions: Optional[List[Dict[str, Any]]] = []
    ripeness: Optional[str] = None
    disease: Optional[str] = None
    image_url: Optional[str] = None
    nutritional_info: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None


class IdentificationDetailResponse(IdentificationResponse):
    id: int
    user_id: int
    fruit_id: Optional[int] = None
    confidence_percentage: int
    is_high_confidence: bool
    top_prediction_names: List[str]
    processing_time_ms: Optional[int] = None
    created_at: datetime


class IdentificationHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    fruit_name: str
    confidence: float
    confidence_percentage: int
    image_url: Optional[str] = None
    created_at: datetime


class BatchIdentificationResponse(BaseModel):
    detections: List[IdentificationResult]
    total: int
    history_ids: Optional[List[int]] = None


class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    fruit_id: int
    fruit_name: str
    fruit_emoji: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime