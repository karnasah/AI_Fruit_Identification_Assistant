import json
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy import func, select, and_, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.notification import Notification
from app.models.favorite import Favorite
from app.models.identification import Identification
from app.models.fruit import Fruit
from app.utils.logger import logger

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        try:
            # Total identifications
            total_idents_result = await self.db.execute(
                select(func.count(Identification.id)).where(Identification.user_id == user_id)
            )
            total_idents = total_idents_result.scalar() or 0

            # Unique fruits
            unique_fruits_result = await self.db.execute(
                select(func.count(func.distinct(Identification.fruit_id))).where(Identification.user_id == user_id)
            )
            unique_fruits = unique_fruits_result.scalar() or 0

            # Success rate (high confidence >= 0.8)
            success_result = await self.db.execute(
                select(func.count(Identification.id)).where(
                    and_(Identification.user_id == user_id, Identification.confidence >= 0.8)
                )
            )
            success_count = success_result.scalar() or 0
            success_rate = (success_count / total_idents * 100) if total_idents else 0.0

            # Streak
            streak_data = await self.get_user_streak(user_id)
            streak = streak_data.get("current", 0)

            # Favorites
            favorites_result = await self.db.execute(
                select(func.count(Favorite.id)).where(Favorite.user_id == user_id)
            )
            favorites_count = favorites_result.scalar() or 0

            # Active days (unique dates)
            active_days_result = await self.db.execute(
                select(func.count(func.distinct(func.date(Identification.created_at)))).where(Identification.user_id == user_id)
            )
            active_days = active_days_result.scalar() or 0

            return {
                "total_identifications": total_idents,
                "unique_fruits": unique_fruits,
                "success_rate": round(success_rate, 1),
                "streak": streak,
                "favorites_count": favorites_count,
                "active_days": active_days,
                "total_identifications_change": 0.0,
                "unique_fruits_change": 0.0,
                "success_rate_change": 0.0,
                "streak_change": 0,
            }
        except Exception as e:
            logger.error(f"Error getting user stats for {user_id}: {e}")
            return {
                "total_identifications": 0, "unique_fruits": 0, "success_rate": 0.0,
                "streak": 0, "favorites_count": 0, "active_days": 0,
                "total_identifications_change": 0.0, "unique_fruits_change": 0.0,
                "success_rate_change": 0.0, "streak_change": 0,
            }

    async def get_hourly_activity(self, user_id: int) -> List[Dict[str, Any]]:
        """Get activity counts by hour for the user"""
        try:
            # Query to get count of identifications grouped by hour
            # SQLite specific extraction of hour
            query = select(
                func.strftime('%H', Identification.created_at).label('hour_val'),
                func.count(Identification.id).label('count')
            ).where(
                Identification.user_id == user_id
            ).group_by('hour_val').order_by('hour_val')

            result = await self.db.execute(query)
            rows = result.all()
            
            # Map of hour value to count
            hour_map = {int(r.hour_val): r.count for r in rows}
            
            # Create a full 24-hour list or a subset like the frontend expects
            # Frontend seems to expect 6 AM, 8 AM, etc.
            # Let's provide a list of common hours
            display_hours = [
                (6, '6 AM'), (8, '8 AM'), (10, '10 AM'), (12, '12 PM'),
                (14, '2 PM'), (16, '4 PM'), (18, '6 PM'), (20, '8 PM'), (22, '10 PM')
            ]
            
            activity_data = []
            for h_val, h_label in display_hours:
                # Combine counts for the 2-hour window
                count = hour_map.get(h_val, 0) + hour_map.get(h_val + 1, 0)
                activity_data.append({
                    "hour": h_label,
                    "count": count
                })
            
            return activity_data
        except Exception as e:
            logger.error(f"Error getting hourly activity for {user_id}: {e}")
            # Fallback to empty list but with the right structure to prevent frontend crash
            # Actually, return some dummy data if everything fails?
            return [
                {"hour": "6 AM", "count": 0},
                {"hour": "8 AM", "count": 0},
                {"hour": "10 AM", "count": 0},
                {"hour": "12 PM", "count": 0},
                {"hour": "2 PM", "count": 0},
                {"hour": "4 PM", "count": 0},
                {"hour": "6 PM", "count": 0},
                {"hour": "8 PM", "count": 0},
                {"hour": "10 PM", "count": 0}
            ]

    async def get_most_identified_fruits(self, user_id: int, limit: int = 10, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """Get user's most identified fruits"""
        try:
            query = select(
                Identification.fruit_id,
                func.count(Identification.id).label('count'),
                Fruit.name.label('name'),
                Fruit.emoji.label('emoji')
            ).outerjoin(Fruit, Identification.fruit_id == Fruit.id).where(Identification.user_id == user_id)

            if start_date:
                query = query.where(Identification.created_at >= start_date)
            if end_date:
                query = query.where(Identification.created_at <= end_date)

            query = query.group_by(Identification.fruit_id, Fruit.name, Fruit.emoji).order_by(desc('count')).limit(limit)

            result = await self.db.execute(query)
            rows = result.all()
            
            total_idents = sum(r.count for r in rows) or 1
            return [{
                'name': r.name or 'Unknown',
                'count': r.count,
                'emoji': r.emoji or '',
                'percentage': round((r.count / total_idents) * 100, 1)
            } for r in rows]
        except Exception as e:
            logger.error(f"Error getting most identified fruits for {user_id}: {e}")
            return []

    async def get_user_activity(self, user_id: int, limit: int = 20, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """Get recent user activities"""
        try:
            query = select(Identification).where(Identification.user_id == user_id).order_by(desc(Identification.created_at)).limit(limit)

            if start_date:
                query = query.where(Identification.created_at >= start_date)
            if end_date:
                query = query.where(Identification.created_at <= end_date)

            result = await self.db.execute(query)
            idents = result.scalars().all()
            
            return [{
                "id": i.id, 
                "type": "identification", 
                "fruit_name": i.fruit_name or "Unknown",
                "confidence": i.confidence or 0.0, 
                "timestamp": i.created_at,
                "image_url": i.image_url or ""
            } for i in idents]
        except Exception as e:
            logger.error(f"Error getting user activity for {user_id}: {e}")
            return []

    async def get_user_streak(self, user_id: int) -> Dict[str, Any]:
        """Calculate current and longest streak"""
        try:
            # Get distinct dates of activity in the last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            query = select(func.date(Identification.created_at)).where(
                and_(Identification.user_id == user_id, Identification.created_at >= start_date)
            ).distinct().order_by(desc(func.date(Identification.created_at)))
            
            result = await self.db.execute(query)
            dates = [r[0] for r in result.all()]
            
            if not dates:
                return {"current": 0, "longest": 0, "last_active": None}

            # Calculate current streak
            current = 0
            today = datetime.utcnow().date()
            yesterday = today - timedelta(days=1)
            
            # Check if active today or yesterday
            if dates[0] == today or dates[0] == yesterday:
                current = 1
                for i in range(len(dates) - 1):
                    if (dates[i] - dates[i+1]).days == 1:
                        current += 1
                    else:
                        break
            
            # Longest streak (simplified for this period)
            longest = current # In a real app, this would be stored or calculated over all history
            
            return {
                "current": current,
                "longest": longest,
                "last_active": dates[0],
                "next_milestone": current + 1,
                "days_to_next_milestone": 1
            }
        except Exception as e:
            logger.error(f"Error calculating streak for {user_id}: {e}")
            return {"current": 0, "longest": 0, "last_active": None}

    async def get_user_achievements(self, user_id: int) -> List[Dict]:
        """Get user achievements (stub - implement Achievement model later)"""
        return [  # Static for now
            {"id": 1, "name": "First Identification", "description": "Made your first ID", "icon": "🏆",
             "earned": True, "earned_at": "2024-01-01", "progress": 100, "target": 1}
        ]

    async def get_user_ranking(self, user_id: int, ranking_type: str = "weekly") -> Dict:
        """Get user's ranking position (stub simplified)"""
        return {"rank": 42, "total_users": 1000, "score": 150, "percentile": 95.8}

    async def get_leaderboard(self, ranking_type: str = "weekly", limit: int = 10) -> List[Dict]:
        """Global leaderboard (stub)"""
        return [{"rank": i+1, "user_id": 100+i, "user_name": f"User{i}", "score": 1000-i*10} for i in range(limit)]

    async def get_notifications(self, user_id: int, page: int = 1, limit: int = 20, unread_only: bool = False) -> List[Notification]:
        """Paginated notifications"""
        try:
            query = select(Notification).where(Notification.user_id == user_id)
            if unread_only:
                query = query.where(Notification.is_read == False)
            query = query.order_by(desc(Notification.created_at)).offset((page-1)*limit).limit(limit)
            
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error getting notifications for {user_id}: {e}")
            return []

    async def get_unread_count(self, user_id: int) -> int:
        try:
            count_result = await self.db.execute(
                select(func.count(Notification.id)).where(
                    and_(Notification.user_id == user_id, Notification.is_read == False)
                )
            )
            return count_result.scalar() or 0
        except Exception as e:
            logger.error(f"Error getting unread count for {user_id}: {e}")
            return 0

    async def mark_notification_read(self, notification_id: int, user_id: int) -> bool:
        try:
            query = select(Notification).where(
                and_(Notification.id == notification_id, Notification.user_id == user_id)
            )
            result = await self.db.execute(query)
            notif = result.scalar_one_or_none()
            
            if notif:
                notif.is_read = True
                notif.read_at = datetime.utcnow()
                await self.db.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Error marking notification read: {e}")
            await self.db.rollback()
            return False

    async def mark_all_notifications_read(self, user_id: int):
        try:
            from sqlalchemy import update
            query = update(Notification).where(
                and_(Notification.user_id == user_id, Notification.is_read == False)
            ).values(is_read=True, read_at=datetime.utcnow())
            
            await self.db.execute(query)
            await self.db.commit()
        except Exception as e:
            logger.error(f"Error marking all notifications read: {e}")
            await self.db.rollback()

    async def get_favorites_stats(self, user_id: int) -> Dict:
        """Favorites statistics by category"""
        try:
            query = select(func.count(Favorite.id).label('count'), Fruit.category).\
                outerjoin(Fruit, Favorite.fruit_id == Fruit.id).\
                where(Favorite.user_id == user_id).\
                group_by(Fruit.category)
            
            result = await self.db.execute(query)
            return {row.category: row.count for row in result.all() if row.category}
        except Exception as e:
            logger.error(f"Error getting favorites stats for {user_id}: {e}")
            return {}

    async def export_statistics(self, user_id: int, format: str = "pdf", start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> str:
        """Stub export - return static path"""
        return "/static/exports/stats.pdf"

    async def get_active_users_count(self) -> int:
        """Stub active users - in real app would query analytics or active sessions"""
        return 25

    async def get_widget_config(self, user_id: int) -> Dict:
        """Widget config from user prefs (stub)"""
        return {"layout": "default", "widgets": ["stats", "analytics", "recent"]}

    async def update_widget_config(self, user_id: int, config: Dict):
        """Update widget config (stub)"""
        pass

    async def reset_dashboard(self, user_id: int):
        """Reset to default"""
        pass

    async def get_success_rate(self, user_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict:
        """Success rate details"""
        stats = await self.get_user_stats(user_id)
        return {
            "rate": stats["success_rate"],
            "total": stats["total_identifications"],
            "successful": int(stats["total_identifications"] * stats["success_rate"] / 100),
            "change": 0.0
        }

