"""
Dashboard API Endpoints
User statistics, analytics, and activity data
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.deps import DBSession, CurrentUser
from app.models.identification import Identification
from app.models.favorite import Favorite
from app.utils.logger import logger

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get user's dashboard statistics
    """
    try:
        # Total identifications
        total_result = await db.execute(
            select(func.count(Identification.id)).where(Identification.user_id == current_user.id)
        )
        total_identifications = total_result.scalar_one() or 0
        
        # Unique fruits identified
        unique_result = await db.execute(
            select(func.count(Identification.fruit_name.distinct())).where(
                Identification.user_id == current_user.id
            )
        )
        unique_fruits = unique_result.scalar_one() or 0
        
        # Success rate (identifications with confidence > 0.7)
        success_result = await db.execute(
            select(func.count(Identification.id)).where(
                Identification.user_id == current_user.id,
                Identification.confidence >= 0.7
            )
        )
        successful = success_result.scalar_one() or 0
        success_rate = round((successful / total_identifications * 100), 1) if total_identifications > 0 else 0
        
        # Favorites count
        fav_result = await db.execute(
            select(func.count(Favorite.id)).where(Favorite.user_id == current_user.id)
        )
        favorites_count = fav_result.scalar_one() or 0
        
        # Count distinct active dates in the last seven days.
        week_ago = datetime.utcnow() - timedelta(days=7)
        streak_result = await db.execute(
            select(func.count(func.distinct(func.date(Identification.created_at))))
            .where(
                Identification.user_id == current_user.id,
                Identification.created_at >= week_ago
            )
        )
        active_days = streak_result.scalar_one() or 0
        
        return {
            "total_identifications": total_identifications,
            "unique_fruits": unique_fruits,
            "success_rate": success_rate,
            "streak": active_days,
            "favorites_count": favorites_count,
            "active_days": active_days,
            "total_identifications_change": 0,
            "unique_fruits_change": 0,
            "success_rate_change": 0,
            "streak_change": 0,
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        return {
            "total_identifications": 0,
            "unique_fruits": 0,
            "success_rate": 0,
            "streak": 0,
            "favorites_count": 0,
            "active_days": 0,
            "total_identifications_change": 0,
            "unique_fruits_change": 0,
            "success_rate_change": 0,
            "streak_change": 0,
        }


@router.get("/most-identified")
async def get_most_identified_fruits(
    limit: int = Query(5, ge=1, le=20),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get user's most identified fruits
    """
    try:
        result = await db.execute(
            select(Identification.fruit_name, func.count(Identification.id))
            .where(Identification.user_id == current_user.id)
            .group_by(Identification.fruit_name)
            .order_by(desc(func.count(Identification.id)))
            .limit(limit)
        )
        fruits = result.all()
        
        total = sum(f[1] for f in fruits)
        
        return [
            {
                "name": f[0],
                "count": f[1],
                "emoji": "🍎",
                "percentage": round(f[1]/total*100, 1) if total > 0 else 0
            }
            for f in fruits
        ]
    except Exception as e:
        logger.error(f"Most identified fruits error: {e}")
        return []


@router.get("/activity")
async def get_user_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get user's recent activity timeline
    """
    try:
        result = await db.execute(
            select(Identification)
            .where(Identification.user_id == current_user.id)
            .order_by(desc(Identification.created_at))
            .limit(limit)
        )
        activities = result.scalars().all()
        
        return [
            {
                "id": a.id,
                "type": "identification",
                "fruit_name": a.fruit_name,
                "confidence": a.confidence,
                "timestamp": a.created_at.isoformat(),
                "image_url": a.image_url,
            }
            for a in activities
        ]
    except Exception as e:
        logger.error(f"User activity error: {e}")
        return []


@router.get("/streak")
async def get_user_streak(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Get user's current streak
    """
    try:
        # Get dates of identifications in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        result = await db.execute(
            select(Identification.created_at)
            .where(
                Identification.user_id == current_user.id,
                Identification.created_at >= thirty_days_ago
            )
            .order_by(Identification.created_at)
        )
        dates = [r[0].date() for r in result.all()]
        
        # Calculate current streak
        current_streak = 0
        today = datetime.utcnow().date()
        
        for i in range(30):
            check_date = today - timedelta(days=i)
            if check_date in dates:
                current_streak += 1
            else:
                break
        
        return {
            "current_streak": current_streak,
            "longest_streak": current_streak,
            "last_active": datetime.utcnow().isoformat(),
            "next_milestone": 7,
            "days_to_next_milestone": max(0, 7 - current_streak),
        }
    except Exception as e:
        logger.error(f"Streak error: {e}")
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_active": None,
            "next_milestone": 7,
            "days_to_next_milestone": 7,
        }