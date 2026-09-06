"""
Common Schemas
Shared Pydantic models for pagination and responses
"""

from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)
    
    """Paginated response wrapper"""
    data: List[T]
    total: int
    page: int
    limit: int
    pages: int


class HealthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    """Health check response"""
    status: str
    app_name: str
    version: str
    environment: str


class ErrorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    """Error response"""
    error: str
    message: str
    status_code: int
    details: Optional[dict] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    """Simple message response"""
    message: str
    data: Optional[dict] = None

