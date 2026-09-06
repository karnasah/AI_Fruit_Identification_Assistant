"""
Analytics Service
Handles user analytics, activity tracking, and statistics
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, extract

from app.models.analytics import AnalyticsEvent, UserActivityLog, DailyStats
from app.models.identification import Identification
from app.models.user import User
from app.utils.logger import logger


class AnalyticsService:
    """Service for analytics operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ==================== Event Tracking ====================
    
    async def track_event(
        self,
        user_id: Optional[int],
        event_type: str,
        event_name: str,
        event_data: Optional[Dict] = None,
        duration_ms: Optional[int] = None,
        success: bool = True,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> AnalyticsEvent:
        """Track an analytics event"""
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            event_name=event_name,
            event_data=event_data or {},
            duration_ms=duration_ms,
            success=success,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            created_at=datetime.utcnow(),
        )
        
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        
        return event
    
    async def track_user_activity(
        self,
        user_id: int,
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        changes: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
    ) -> UserActivityLog:
        """Track user activity for audit trail"""
        activity = UserActivityLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            changes=changes,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message,
            created_at=datetime.utcnow(),
        )
        
        self.db.add(activity)
        await self.db.commit()
        await self.db.refresh(activity)
        
        return activity
    
    # ==================== Identification Analytics ====================
    
    async def get_identification_analytics(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        period: str = "week",
    ) -> Dict[str, Any]:
        """Get identification analytics for user"""
        query = select(Identification).where(Identification.user_id == user_id)
        
        if start_date:
            query = query.where(Identification.created_at >= start_date)
        if end_date:
            query = query.where(Identification.created_at <= end_date)
        
        result = await self.db.execute(query)
        identifications = result.scalars().all()
        
        # Group by date
        daily_counts = {}
        for ident in identifications:
            date_key = ident.created_at.strftime("%Y-%m-%d")
            daily_counts[date_key] = daily_counts.get(date_key, 0) + 1
        
        # Prepare labels and data
        if period == "week":
            labels = [(datetime.utcnow() - timedelta(days=i)).strftime("%a") for i in range(6, -1, -1)]
            data = [daily_counts.get((datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), 0) for i in range(6, -1, -1)]
        elif period == "month":
            labels = [(datetime.utcnow() - timedelta(days=i)).strftime("%d") for i in range(29, -1, -1)]
            data = [daily_counts.get((datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), 0) for i in range(29, -1, -1)]
        else:
            labels = [f"Month {i}" for i in range(1, 13)]
            data = [0] * 12
        
        return {
            "labels": labels,
            "data": data,
            "total": len(identifications),
            "average": len(identifications) / len(labels) if labels else 0,
            "peak": max(data) if data else 0,
            "peak_date": labels[data.index(max(data))] if data and max(data) > 0 else None,
        }
    
    async def get_weekly_activity(self, user_id: int) -> Dict[str, Any]:
        """Get weekly activity summary"""
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        
        result = await self.db.execute(
            select(
                extract('dow', Identification.created_at).label('day'),
                func.count(Identification.id)
            )
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= week_ago
            )
            .group_by(extract('dow', Identification.created_at))
        )
        
        day_counts = {row[0]: row[1] for row in result.all()}
        
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        # Adjust for PostgreSQL dow (0=Sunday)
        return {
            "labels": days,
            "data": [day_counts.get(i + 1, 0) for i in range(7)],
        }
    
    async def get_monthly_activity(self, user_id: int, year: int, month: int) -> Dict[str, Any]:
        """Get monthly activity summary"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        result = await self.db.execute(
            select(
                extract('day', Identification.created_at).label('day'),
                func.count(Identification.id)
            )
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date,
                Identification.created_at < end_date
            )
            .group_by(extract('day', Identification.created_at))
        )
        
        day_counts = {int(row[0]): row[1] for row in result.all()}
        
        days_in_month = (end_date - start_date).days
        data = [day_counts.get(day, 0) for day in range(1, days_in_month + 1)]
        
        return {
            "labels": [str(day) for day in range(1, days_in_month + 1)],
            "data": data,
            "total": sum(data),
        }
    
    async def get_yearly_activity(self, user_id: int, year: int) -> Dict[str, Any]:
        """Get yearly activity summary"""
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)
        
        result = await self.db.execute(
            select(
                extract('month', Identification.created_at).label('month'),
                func.count(Identification.id)
            )
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date,
                Identification.created_at < end_date
            )
            .group_by(extract('month', Identification.created_at))
        )
        
        month_counts = {int(row[0]): row[1] for row in result.all()}
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        data = [month_counts.get(i + 1, 0) for i in range(12)]
        
        return {
            "labels": months,
            "data": data,
            "total": sum(data),
        }
    
    async def get_trends(self, user_id: int, period: str = "week", limit: int = 10) -> Dict[str, Any]:
        """Get identification trends"""
        start_date = datetime.utcnow() - timedelta(days=30 if period == "month" else 7)
        
        result = await self.db.execute(
            select(
                Identification.fruit_name,
                func.count(Identification.id)
            )
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date
            )
            .group_by(Identification.fruit_name)
            .order_by(func.count(Identification.id).desc())
            .limit(limit)
        )
        
        trends = [{"name": name, "count": count} for name, count in result.all()]
        
        return {
            "trends": trends,
            "period": period,
        }
    
    async def get_seasonal_popularity(self, user_id: int, year: int) -> Dict[str, Any]:
        """Get seasonal fruit popularity"""
        seasons = {"Spring": [3, 4, 5], "Summer": [6, 7, 8], "Fall": [9, 10, 11], "Winter": [12, 1, 2]}
        result = {}
        
        for season, months in seasons.items():
            query = select(func.count(Identification.id)).where(
                Identification.user_id == user_id,
                extract('year', Identification.created_at) == year,
                extract('month', Identification.created_at).in_(months)
            )
            count_result = await self.db.execute(query)
            count = count_result.scalar_one() or 0
            result[season] = count
        
        return result
    
    async def get_category_distribution(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Get fruit category distribution"""
        query = select(Identification).where(Identification.user_id == user_id)
        
        if start_date:
            query = query.where(Identification.created_at >= start_date)
        if end_date:
            query = query.where(Identification.created_at <= end_date)
        
        result = await self.db.execute(query)
        identifications = result.scalars().all()
        
        # Categorize fruits (simplified)
        categories = {
            "Citrus": 0,
            "Berries": 0,
            "Tropical": 0,
            "Stone Fruits": 0,
            "Pome Fruits": 0,
            "Melons": 0,
            "Other": 0,
        }
        
        citrus = ["orange", "lemon", "lime", "grapefruit", "mandarin"]
        berries = ["strawberry", "blueberry", "raspberry", "blackberry", "cranberry"]
        tropical = ["banana", "mango", "pineapple", "papaya", "coconut", "kiwi"]
        stone_fruits = ["peach", "plum", "apricot", "cherry", "nectarine"]
        pome_fruits = ["apple", "pear", "quince"]
        melons = ["watermelon", "cantaloupe", "honeydew"]
        
        for ident in identifications:
            name = ident.fruit_name.lower()
            if any(c in name for c in citrus):
                categories["Citrus"] += 1
            elif any(b in name for b in berries):
                categories["Berries"] += 1
            elif any(t in name for t in tropical):
                categories["Tropical"] += 1
            elif any(s in name for s in stone_fruits):
                categories["Stone Fruits"] += 1
            elif any(p in name for p in pome_fruits):
                categories["Pome Fruits"] += 1
            elif any(m in name for m in melons):
                categories["Melons"] += 1
            else:
                categories["Other"] += 1
        
        return categories
    
    async def get_time_distribution(self, user_id: int) -> Dict[str, Any]:
        """Get identification time distribution (hour of day)"""
        result = await self.db.execute(
            select(
                extract('hour', Identification.created_at).label('hour'),
                func.count(Identification.id)
            )
            .where(Identification.user_id == user_id)
            .group_by(extract('hour', Identification.created_at))
        )
        
        hour_counts = {int(row[0]): row[1] for row in result.all()}
        
        data = [hour_counts.get(hour, 0) for hour in range(24)]
        
        return {
            "labels": [f"{h}:00" for h in range(24)],
            "data": data,
        }
    
    async def get_day_of_week_distribution(self, user_id: int) -> Dict[str, Any]:
        """Get identification distribution by day of week"""
        result = await self.db.execute(
            select(
                extract('dow', Identification.created_at).label('dow'),
                func.count(Identification.id)
            )
            .where(Identification.user_id == user_id)
            .group_by(extract('dow', Identification.created_at))
        )
        
        dow_counts = {int(row[0]): row[1] for row in result.all()}
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        data = [dow_counts.get(i + 1, 0) for i in range(7)]
        
        return {
            "labels": days,
            "data": data,
        }
    
    async def get_period_comparison(self, user_id: int, period: str) -> Dict[str, Any]:
        """Get comparison with previous period"""
        current_start = datetime.utcnow() - timedelta(days=7 if period == "week_over_week" else 30)
        previous_start = current_start - timedelta(days=7 if period == "week_over_week" else 30)
        
        # Current period
        current_result = await self.db.execute(
            select(func.count(Identification.id))
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= current_start
            )
        )
        current = current_result.scalar_one() or 0
        
        # Previous period
        previous_result = await self.db.execute(
            select(func.count(Identification.id))
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= previous_start,
                Identification.created_at < current_start
            )
        )
        previous = previous_result.scalar_one() or 0
        
        change = ((current - previous) / previous * 100) if previous > 0 else 0
        
        return {
            "current": current,
            "previous": previous,
            "change": round(change, 1),
            "trend": "up" if change > 0 else "down" if change < 0 else "stable",
        }
    
    async def get_search_analytics(self, user_id: int, limit: int = 10) -> List[Dict]:
        """Get search analytics"""
        # Placeholder - would track actual searches
        return []
    
    async def get_engagement_metrics(self, user_id: int) -> Dict[str, Any]:
        """Get user engagement metrics"""
        # Last 30 days
        start_date = datetime.utcnow() - timedelta(days=30)
        
        # Total identifications
        ident_result = await self.db.execute(
            select(func.count(Identification.id))
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date
            )
        )
        total_identifications = ident_result.scalar_one() or 0
        
        # Active days
        active_result = await self.db.execute(
            select(func.count(func.distinct(extract('day', Identification.created_at))))
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date
            )
        )
        active_days = active_result.scalar_one() or 0
        
        return {
            "total_identifications": total_identifications,
            "active_days": active_days,
            "avg_daily": round(total_identifications / 30, 1),
            "engagement_rate": round(active_days / 30 * 100, 1),
        }
    
    async def get_retention_metrics(self, user_id: int) -> Dict[str, Any]:
        """Get retention metrics"""
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            return {}
        
        days_since_join = (datetime.utcnow() - user.created_at).days
        
        # Check if user was active in last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        active_result = await self.db.execute(
            select(func.count(Identification.id))
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= week_ago
            )
        )
        is_active = (active_result.scalar_one() or 0) > 0
        
        return {
            "days_since_join": days_since_join,
            "is_active": is_active,
            "retention_status": "active" if is_active else "inactive",
        }
    
    async def get_activity_heatmap(self, user_id: int, year: int, month: int) -> Dict[str, Any]:
        """Get activity heatmap data"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        result = await self.db.execute(
            select(
                extract('day', Identification.created_at).label('day'),
                func.count(Identification.id)
            )
            .where(
                Identification.user_id == user_id,
                Identification.created_at >= start_date,
                Identification.created_at < end_date
            )
            .group_by(extract('day', Identification.created_at))
        )
        
        day_counts = {int(row[0]): row[1] for row in result.all()}
        
        days_in_month = (end_date - start_date).days
        data = [{"day": day, "count": day_counts.get(day, 0)} for day in range(1, days_in_month + 1)]
        
        return {
            "year": year,
            "month": month,
            "data": data,
            "max_count": max([d["count"] for d in data]) if data else 0,
        }