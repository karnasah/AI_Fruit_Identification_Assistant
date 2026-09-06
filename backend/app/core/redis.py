"""
Redis Configuration
Redis client setup for caching, sessions, and task queues
"""

import json
from typing import Optional, Any, Union
from redis import asyncio as aioredis
from redis.exceptions import RedisError

from app.core.config import settings
from app.utils.logger import logger

# Redis client instance
redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> aioredis.Redis:
    """
    Get or create Redis client
    
    Returns:
        Redis client instance
    """
    global redis_client
    if redis_client is None:
        try:
            redis_client = await aioredis.from_url(
                settings.REDIS_URL,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                encoding="utf-8",
            )
            # Test connection
            await redis_client.ping()
            logger.info("Redis connected successfully")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            raise
    return redis_client


async def close_redis() -> None:
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        logger.info("Redis connection closed")


async def set_cache(
    key: str,
    value: Any,
    ttl: int = 300,  # 5 minutes default
    serialize: bool = True,
) -> bool:
    """
    Set value in cache
    
    Args:
        key: Cache key
        value: Value to store
        ttl: Time to live in seconds
        serialize: Whether to serialize as JSON
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = await get_redis_client()
        
        if serialize and not isinstance(value, str):
            value = json.dumps(value)
        
        await client.setex(key, ttl, value)
        return True
        
    except RedisError as e:
        logger.error(f"Redis set error: {e}")
        return False


async def get_cache(key: str, deserialize: bool = True) -> Optional[Any]:
    """
    Get value from cache
    
    Args:
        key: Cache key
        deserialize: Whether to deserialize from JSON
    
    Returns:
        Cached value or None
    """
    try:
        client = await get_redis_client()
        value = await client.get(key)
        
        if value and deserialize:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        
        return value
        
    except RedisError as e:
        logger.error(f"Redis get error: {e}")
        return None


async def delete_cache(key: str) -> bool:
    """
    Delete value from cache
    
    Args:
        key: Cache key
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = await get_redis_client()
        await client.delete(key)
        return True
        
    except RedisError as e:
        logger.error(f"Redis delete error: {e}")
        return False


async def clear_cache_pattern(pattern: str) -> int:
    """
    Clear all keys matching a pattern
    
    Args:
        pattern: Key pattern (e.g., "user:*")
    
    Returns:
        Number of keys deleted
    """
    try:
        client = await get_redis_client()
        keys = await client.keys(pattern)
        
        if keys:
            return await client.delete(*keys)
        return 0
        
    except RedisError as e:
        logger.error(f"Redis clear pattern error: {e}")
        return 0


async def cache_exists(key: str) -> bool:
    """
    Check if key exists in cache
    
    Args:
        key: Cache key
    
    Returns:
        True if exists, False otherwise
    """
    try:
        client = await get_redis_client()
        return await client.exists(key) > 0
        
    except RedisError as e:
        logger.error(f"Redis exists error: {e}")
        return False


async def increment_counter(key: str, amount: int = 1) -> Optional[int]:
    """
    Increment a counter in Redis
    
    Args:
        key: Counter key
        amount: Amount to increment
    
    Returns:
        New counter value or None
    """
    try:
        client = await get_redis_client()
        return await client.incrby(key, amount)
        
    except RedisError as e:
        logger.error(f"Redis increment error: {e}")
        return None


async def get_ttl(key: str) -> Optional[int]:
    """
    Get remaining TTL for a key
    
    Args:
        key: Cache key
    
    Returns:
        TTL in seconds or None
    """
    try:
        client = await get_redis_client()
        return await client.ttl(key)
        
    except RedisError as e:
        logger.error(f"Redis TTL error: {e}")
        return None


# Cache decorator
def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results
    
    Args:
        ttl: Cache TTL in seconds
        key_prefix: Prefix for cache key
    
    Usage:
        @cached(ttl=60, key_prefix="user")
        async def get_user(user_id: int):
            return await db.get_user(user_id)
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix, func.__name__]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f"{k}:{v}" for k, v in kwargs.items())
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_result = await get_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            await set_cache(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator