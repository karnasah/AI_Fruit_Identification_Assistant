"""
AI Fruit Identification Assistant - Main Application Entry Point
FastAPI Backend Server
"""


import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import get_async_engine, close_db, Base
from app.api.v1 import (
    auth,
    users,
    fruits,
    chatbot,
    voice,
    encyclopedia,
    dashboard,
    admin,
    notifications,
    ai_expert,
)
from app.utils.logger import setup_logging
from app.utils.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting up Fruit AI Assistant API...")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"API Version: {settings.APP_VERSION}")
    
    # Create database tables
    try:
        engine = await get_async_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Fruit AI Assistant API...")
    await close_db()
    logger.info("Shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered fruit identification system using computer vision and deep learning",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
)

# Setup CORS - Allow specific origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


# ========================================
# Static Files (for uploads)
# ========================================

try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("Static files mounted at /static")
except Exception as e:
    logger.warning(f"Static files not mounted: {e}")


# ========================================
# API Routes
# ========================================

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return JSONResponse(
        status_code=200,
        content={
            "message": f"Welcome to {settings.APP_NAME} API",
            "version": settings.APP_VERSION,
            "docs_url": "/api/docs" if settings.DEBUG else None,
            "status": "running",
        }
    )


# Include API routers
api_prefix = settings.API_PREFIX

app.include_router(auth.router, prefix=api_prefix, tags=["Authentication"])
app.include_router(users.router, prefix=api_prefix, tags=["Users"])
app.include_router(fruits.router, prefix=api_prefix, tags=["Fruits"])
app.include_router(chatbot.router, prefix=api_prefix, tags=["Chatbot"])
app.include_router(voice.router, prefix=api_prefix, tags=["Voice"])
app.include_router(encyclopedia.router, prefix=api_prefix, tags=["Encyclopedia"])
app.include_router(dashboard.router, prefix=api_prefix, tags=["Dashboard"])
app.include_router(admin.router, prefix=api_prefix, tags=["Admin"])
app.include_router(notifications.router, prefix=api_prefix, tags=["Notifications"])
app.include_router(ai_expert.router, prefix=api_prefix, tags=["AI Expert"])

logger.info("All API routes registered successfully")


# ========================================
# Run the application (for development)
# ========================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )