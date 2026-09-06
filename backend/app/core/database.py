"""
Database Configuration
SQLAlchemy setup, session management, and database utilities
"""

from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine, MetaData
from contextlib import asynccontextmanager

from app.core.config import settings

# Base class for all models
Base = declarative_base()

# Metadata for naming conventions
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)

Base.metadata = metadata


# Async Engine
async_engine: Optional[AsyncEngine] = None
engine = None  # This will be set after initialization


async def get_async_engine() -> AsyncEngine:
    """Get or create async database engine"""
    global async_engine, engine
    if async_engine is None:
        engine_options = {
            "echo": settings.DEBUG,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
        }
        if not settings.database_url_async.startswith("sqlite"):
            engine_options.update(
                pool_size=settings.DATABASE_POOL_SIZE,
                max_overflow=settings.DATABASE_MAX_OVERFLOW,
            )
        async_engine = create_async_engine(settings.database_url_async, **engine_options)
        engine = async_engine
    return async_engine


# Async session factory
async def get_async_session_factory() -> async_sessionmaker:
    """Get async session factory"""
    engine = await get_async_engine()
    return async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


# Standard session factory for non-DI usage
AsyncSessionLocal = async_sessionmaker(
    create_async_engine(settings.database_url_async),
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Dependency for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session dependency
    Usage: db: AsyncSession = Depends(get_db)
    """
    session_factory = await get_async_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session as context manager
    Usage: async with get_db_context() as db:
    """
    session_factory = await get_async_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Sync engine for migrations (alembic)
sync_engine = None


def get_sync_engine():
    """Get sync engine for alembic migrations"""
    global sync_engine
    if sync_engine is None:
        sync_engine = create_engine(
            settings.database_url_sync,
            echo=settings.DEBUG,
            pool_pre_ping=True,
        )
    return sync_engine


async def init_db() -> None:
    """Initialize database - create all tables"""
    engine = await get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections"""
    global async_engine, engine
    if async_engine:
        await async_engine.dispose()
        async_engine = None
        engine = None


async def check_db_connection() -> bool:
    """Check if database connection is working"""
    try:
        session_factory = await get_async_session_factory()
        async with session_factory() as session:
            await session.execute("SELECT 1")
            return True
    except Exception:
        return False


# Export engine for compatibility
engine = async_engine
SessionLocal = None  # Will be set later if needed