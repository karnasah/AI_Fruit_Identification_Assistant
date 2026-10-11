"""
Dashboard API Endpoints
User statistics, analytics, and activity data

Response contract (consumed by useFruitIdentification):
  success  -> { "success": True,  "data": <payload> }
  error    -> HTTPException (hook converts to { "success": False, "error": str })
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser
from app.models.identification import Identification
from app.models.favorite import Favorite
from app.utils.logger import logger

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

DEFAULT_MOST_IDENTIFIED = 5
SUCCESS_CONFIDENCE = 0.7
STREAK_WINDOW_DAYS = 30

FRUIT_EMOJI = {
    "apple": "🍎", "banana": "🍌", "orange": "🍊", "grape": "🍇",
    "strawberry": "🍓", "watermelon": "🍉", "pineapple": "🍍",
    "mango": "🥭", "kiwi": "🥝", "peach": "🍑", "cherry": "🍒",
    "lemon": "🍋", "pear": "🍐", "coconut": "🥥", "avocado": "🥑",
    "pomegranate": "🍎", "papaya": "🥭", "blueberry": "🫐",
}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _utcnow() -> datetime:
    """Timezone-aware UTC now. `datetime.utcnow()` is deprecated in 3.12+."""
    return datetime.now(timezone.utc)


async def _get_totals(db: AsyncSession, user_id: int):
    """Core counters shared by /stats and /most-identified."""
    total = (await db.execute(
        select(func.count(Identification.id))
        .where(Identification.user_id == user_id)
    )).scalar_one() or 0

    unique_fruits = (await db.execute(
        select(func.count(func.distinct(Identification.fruit_name)))
        .where(Identification.user_id == user_id)
    )).scalar_one() or 0

    successful = (await db.execute(
        select(func.count(Identification.id))
        .where(
            Identification.user_id == user_id,
            Identification.confidence >= SUCCESS_CONFIDENCE,
        )
    )).scalar_one() or 0

    favorites = (await db.execute(
        select(func.count(Favorite.id))
        .where(Favorite.user_id == user_id)
    )).scalar_one() or 0

    return total, unique_fruits, successful, favorites


async def _get_most_identified(
    db: AsyncSession,
    user_id: int,
    limit: int,
    total_override: Optional[int] = None,
) -> List[dict]:
    """Top-N fruits. Percentage is share of *all* identifications, not top-N."""
    rows = (await db.execute(
        select(
            Identification.fruit_name,
            func.count(Identification.id).label("count"),
        )
        .where(Identification.user_id == user_id)
        .group_by(Identification.fruit_name)
        .order_by(desc("count"))
        .limit(limit)
    )).all()

    denom = total_override if total_override is not None else sum(r[1] for r in rows)

    return [
        {
            "name": name,
            "count": count,
            "emoji": FRUIT_EMOJI.get((name or "").lower(), "🍎"),
            "percentage": round(count / denom * 100, 1) if denom else 0.0,
        }
        for name, count in rows
    ]


async def _get_streak_data(db: AsyncSession, user_id: int):
    """Returns (current_streak, longest_streak, active_dates_set)."""
    since = _utcnow() - timedelta(days=STREAK_WINDOW_DAYS)
    result = await db.execute(
        select(func.distinct(func.date(Identification.created_at)))
        .where(
            Identification.user_id == user_id,
            Identification.created_at >= since,
        )
    )
    active_dates = {
        datetime.fromisoformat(r[0]).date() if isinstance(r[0], str) else r[0]
        for r in result.all()
    }

    today = _utcnow().date()

    # Current streak: walk backwards from today.
    current = 0
    cursor = today
    while cursor in active_dates:
        current += 1
        cursor -= timedelta(days=1)

    # Longest streak: scan the sorted active dates within the window.
    longest = 0
    run = 0
    prev = None
    for d in sorted(active_dates):
        if prev is not None and d - prev == timedelta(days=1):
            run += 1
        else:
            run = 1
        longest = max(longest, run)
        prev = d

    return current, longest, active_dates


def _empty_stats() -> dict:
    """Zero payload for a brand-new user with no identifications."""
    return {
        "total": 0,
        "mostIdentified": [],
        "total_identifications": 0,
        "unique_fruits": 0,
        "success_rate": 0.0,
        "streak": 0,
        "active_days": 0,
        "favorites_count": 0,
        "total_identifications_change": 0,
        "unique_fruits_change": 0,
        "success_rate_change": 0,
        "streak_change": 0,
    }


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #

@router.get("/stats")
async def get_dashboard_stats(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """
    Consolidated dashboard statistics.

    Returns a flat `data` object containing both:
      - frontend aliases: `total`, `mostIdentified`
      - raw counters used by the DashboardStats component
    """
    try:
        total, unique_fruits, successful, favorites = await _get_totals(db, current_user.id)

        if total == 0:
            return {"success": True, "data": _empty_stats()}

        success_rate = round(successful / total * 100, 1)
        current_streak, _longest, active_dates = await _get_streak_data(db, current_user.id)
        most_identified = await _get_most_identified(
            db, current_user.id, DEFAULT_MOST_IDENTIFIED, total_override=total
        )

        return {
            "success": True,
            "data": {
                # ---- consumed directly by DashboardPage ----
                "total": total,
                "mostIdentified": most_identified,
                # ---- consumed by DashboardStats ----
                "total_identifications": total,
                "unique_fruits": unique_fruits,
                "success_rate": success_rate,
                "streak": current_streak,
                "active_days": len(active_dates),
                "favorites_count": favorites,
                # ---- deltas (TODO: compute vs. previous period) ----
                "total_identifications_change": 0,
                "unique_fruits_change": 0,
                "success_rate_change": 0,
                "streak_change": 0,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Dashboard stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard statistics",
        )


@router.get("/history")
async def get_identification_history(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Paginated identification history, newest first."""
    try:
        rows = (await db.execute(
            select(Identification)
            .where(Identification.user_id == current_user.id)
            .order_by(desc(Identification.created_at))
            .limit(limit)
            .offset(offset)
        )).scalars().all()

        total = (await db.execute(
            select(func.count(Identification.id))
            .where(Identification.user_id == current_user.id)
        )).scalar_one() or 0

        return {
            "success": True,
            "data": {
                "items": [
                    {
                        "id": r.id,
                        "fruit_name": r.fruit_name,
                        "confidence": r.confidence,
                        "image_url": r.image_url,
                        "created_at": r.created_at.isoformat() if r.created_at else None,
                    }
                    for r in rows
                ],
                "total": total,
                "limit": limit,
                "offset": offset,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Identification history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load identification history",
        )


@router.get("/most-identified")
async def get_most_identified_fruits(
    limit: int = Query(DEFAULT_MOST_IDENTIFIED, ge=1, le=20),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Standalone most-identified endpoint (used by the MostIdentified widget)."""
    try:
        total, *_ = await _get_totals(db, current_user.id)
        data = await _get_most_identified(db, current_user.id, limit, total_override=total)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Most identified fruits error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load most identified fruits",
        )


@router.get("/activity")
async def get_user_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Recent activity timeline."""
    try:
        rows = (await db.execute(
            select(Identification)
            .where(Identification.user_id == current_user.id)
            .order_by(desc(Identification.created_at))
            .limit(limit)
        )).scalars().all()

        return {
            "success": True,
            "data": [
                {
                    "id": a.id,
                    "type": "identification",
                    "fruit_name": a.fruit_name,
                    "confidence": a.confidence,
                    "timestamp": a.created_at.isoformat() if a.created_at else None,
                    "image_url": a.image_url,
                }
                for a in rows
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"User activity error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load activity",
        )


@router.get("/streak")
async def get_user_streak(
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Current and longest streak within the rolling window."""
    try:
        current_streak, longest_streak, _active = await _get_streak_data(db, current_user.id)
        next_milestone = 7 if current_streak < 7 else 30

        return {
            "success": True,
            "data": {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_active": _utcnow().isoformat(),
                "next_milestone": next_milestone,
                "days_to_next_milestone": max(0, next_milestone - current_streak),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Streak error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load streak",
        )