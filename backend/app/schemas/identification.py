"""
Identification Schemas
Pydantic models for fruit identification history and results
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class IdentificationBase(BaseModel):
    """Base identification schema"""
    fruit_name: str = Field(..., max_length=100)
    confidence: float = Field(..., ge=0, le=1)
    top_predictions: Optional[List[Dict[str, Any]]] = []
    image_url: Optional[str] = None
    ripeness: Optional[str] = None
    ripeness_confidence: Optional[float] = Field(None, ge=0, le=1)
    disease: Optional[str] = None
    disease_confidence: Optional[float] = Field(None, ge=0, le=1)
    bounding_boxes: Optional[List[Dict[str, Any]]] = []
    processing_time_ms: Optional[int] = None


class IdentificationCreate(IdentificationBase):
    """Identification creation schema"""
    user_id: int
    fruit_id: Optional[int] = None
    image_path: Optional[str] = None


class IdentificationResponse(BaseModel):
    """Identification response schema"""
    id: Optional[int] = None
    fruit_name: str
    confidence: float
    top_predictions: Optional[List[Dict[str, Any]]] = []
    ripeness: Optional[str] = None
    disease: Optional[str] = None
    image_url: Optional[str] = None
    nutritional_info: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IdentificationDetailResponse(IdentificationResponse):
    """Detailed identification response"""
    id: int
    user_id: int
    fruit_id: Optional[int] = None
    confidence_percentage: int
    is_high_confidence: bool
    top_prediction_names: List[str]
    processing_time_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class IdentificationHistoryResponse(BaseModel):
    """Identification history list item"""
    id: int
    fruit_name: str
    confidence: float
    confidence_percentage: int
    image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class BatchIdentificationResponse(BaseModel):
    """Batch identification response"""
    detections: List[IdentificationResponse]
    total: int
    history_ids: Optional[List[int]] = None


class IdentificationStatsResponse(BaseModel):
    """Identification statistics response"""
    total_identifications: int = 0
    unique_fruits: int = 0
    success_rate: float = 0.0
    average_confidence: float = 0.0
    most_identified_fruits: List[Dict[str, Any]] = []
    weekly_activity: List[int] = []
    monthly_activity: List[int] = []
    favorite_fruits: List[Dict[str, Any]] = []
    streak: int = 0


class RipenessDetectionResponse(BaseModel):
    """Ripeness detection response"""
    ripeness: str = Field(..., description="ripe, unripe, overripe")
    confidence: float
    indicators: Dict[str, Any] = {}
    suggestions: Optional[str] = None


class DiseaseDetectionResponse(BaseModel):
    """Disease detection response"""
    disease_name: str
    confidence: float
    severity: str = Field(..., description="low, medium, high")
    description: str
    treatment: Optional[str] = None
    prevention: Optional[str] = None