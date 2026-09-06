"""
Initialize Database
Creates all database tables and sets up the initial schema
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import init_db, engine, Base
from app.core.config import settings
from app.utils.logger import logger


async def init_database() -> None:
    """
    Initialize database - create all tables
    """
    logger.info("Initializing database...")
    logger.info(f"Database URL: {settings.database_url_async}")
    
    try:
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Verify connection
        from app.core.database import check_db_connection
        
        if await check_db_connection():
            logger.info("Database connection verified")
        else:
            logger.error("Database connection verification failed")
            
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


async def drop_database() -> None:
    """
    Drop all database tables (use with caution!)
    """
    logger.warning("Dropping all database tables...")
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        
        logger.info("All database tables dropped")
        
    except Exception as e:
        logger.error(f"Failed to drop database: {e}")
        raise


async def reset_database() -> None:
    """
    Reset database - drop and recreate all tables
    """
    logger.warning("Resetting database...")
    await drop_database()
    await init_database()
    logger.info("Database reset completed")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management script")
    parser.add_argument(
        "action",
        choices=["init", "drop", "reset"],
        help="Action to perform: init (create tables), drop (delete tables), reset (drop and recreate)"
    )
    
    args = parser.parse_args()
    
    if args.action == "init":
        asyncio.run(init_database())
    elif args.action == "drop":
        asyncio.run(drop_database())
    elif args.action == "reset":
        asyncio.run(reset_database())