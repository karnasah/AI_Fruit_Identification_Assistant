"""
Encyclopedia Service
Handles fruit encyclopedia, search, categories, and comparisons
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.models.fruit import Fruit
from app.models.identification import Identification
from app.utils.logger import logger


class EncyclopediaService:
    """Service for encyclopedia operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_fruits(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        season: Optional[str] = None,
        nutrition: Optional[str] = None,
        sort: str = "name",
        order: str = "asc",
    ) -> Tuple[List[Fruit], int]:
        """Get all fruits with pagination and filters"""
        query = select(Fruit).where(Fruit.is_active == True)
        
        # Apply search filter
        if search:
            query = query.where(
                or_(
                    Fruit.name.ilike(f"%{search}%"),
                    Fruit.scientific_name.ilike(f"%{search}%"),
                )
            )
        
        # Apply category filter
        if category:
            query = query.where(Fruit.category == category)
        
        # Apply season filter
        if season:
            query = query.where(Fruit.season == season)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        # Apply sorting
        if sort == "name":
            order_by = Fruit.name.asc() if order == "asc" else Fruit.name.desc()
        elif sort == "calories":
            calories = Fruit.nutrition["calories"].as_integer()
            order_by = calories.asc() if order == "asc" else calories.desc()
        elif sort == "season":
            order_by = Fruit.season.asc() if order == "asc" else Fruit.season.desc()
        elif sort == "popularity":
            order_by = Fruit.popularity.asc() if order == "asc" else Fruit.popularity.desc()
        else:
            order_by = Fruit.name.asc()
        
        query = query.order_by(order_by)
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        
        result = await self.db.execute(query)
        fruits = result.scalars().all()
        
        return list(fruits), total
    
    async def get_fruit_by_name(self, name: str) -> Optional[Fruit]:
        """Get fruit by name"""
        result = await self.db.execute(
            select(Fruit).where(Fruit.name.ilike(name), Fruit.is_active == True)
        )
        return result.scalar_one_or_none()
    
    async def get_fruit_by_id(self, fruit_id: int) -> Optional[Fruit]:
        """Get fruit by ID"""
        result = await self.db.execute(
            select(Fruit).where(Fruit.id == fruit_id, Fruit.is_active == True)
        )
        return result.scalar_one_or_none()
    
    async def search_fruits(self, query: str, limit: int = 10) -> List[Fruit]:
        """Search fruits by name or description"""
        result = await self.db.execute(
            select(Fruit)
            .where(
                or_(
                    Fruit.name.ilike(f"%{query}%"),
                    Fruit.scientific_name.ilike(f"%{query}%"),
                ),
                Fruit.is_active == True
            )
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Get all fruit categories with counts"""
        result = await self.db.execute(
            select(Fruit.category, func.count(Fruit.id))
            .where(Fruit.is_active == True, Fruit.category.isnot(None))
            .group_by(Fruit.category)
            .order_by(Fruit.category)
        )
        categories = result.all()
        
        return [
            {
                "id": i,
                "name": cat[0],
                "icon": self._get_category_icon(cat[0]),
                "color": self._get_category_color(cat[0]),
                "fruit_count": cat[1],
            }
            for i, cat in enumerate(categories)
        ]
    
    async def get_seasons(self) -> List[Dict[str, Any]]:
        """Get all seasons with fruit counts"""
        seasons = ["Spring", "Summer", "Fall", "Winter"]
        result = []
        
        for season in seasons:
            count_result = await self.db.execute(
                select(func.count(Fruit.id)).where(
                    Fruit.season == season,
                    Fruit.is_active == True
                )
            )
            count = count_result.scalar_one() or 0
            
            result.append({
                "name": season,
                "icon": self._get_season_icon(season),
                "months": self._get_season_months(season),
                "fruit_count": count,
            })
        
        return result
    
    async def get_fruits_by_category(
        self,
        category_name: str,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Fruit], int]:
        """Get fruits by category"""
        query = select(Fruit).where(
            Fruit.category == category_name,
            Fruit.is_active == True
        )
        
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        fruits = result.scalars().all()
        
        return list(fruits), total
    
    async def get_fruits_by_season(
        self,
        season_name: str,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Fruit], int]:
        """Get fruits by season"""
        query = select(Fruit).where(
            Fruit.season == season_name,
            Fruit.is_active == True
        )
        
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        fruits = result.scalars().all()
        
        return list(fruits), total
    
    async def get_current_season_fruits(self, limit: int = 10) -> List[Fruit]:
        """Get fruits currently in season"""
        current_month = datetime.utcnow().month
        season = self._get_season_by_month(current_month)
        
        result = await self.db.execute(
            select(Fruit)
            .where(Fruit.season == season, Fruit.is_active == True)
            .order_by(Fruit.popularity.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_fruits_by_month(self, month: int, limit: int = 20) -> List[Fruit]:
        """Get fruits in season for a specific month"""
        season = self._get_season_by_month(month)
        
        result = await self.db.execute(
            select(Fruit)
            .where(Fruit.season == season, Fruit.is_active == True)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def compare_fruits(self, fruit1: Fruit, fruit2: Fruit) -> Dict[str, Any]:
        """Compare two fruits"""
        comparison = {
            "nutrition": self._compare_nutrition(fruit1.nutrition, fruit2.nutrition),
            "calories": {
                "fruit1": fruit1.nutrition.get("calories") if fruit1.nutrition else 0,
                "fruit2": fruit2.nutrition.get("calories") if fruit2.nutrition else 0,
            },
            "winner": None,
        }
        
        # Determine winner based on nutritional value
        score1 = self._calculate_nutrition_score(fruit1.nutrition)
        score2 = self._calculate_nutrition_score(fruit2.nutrition)
        
        if score1 > score2:
            comparison["winner"] = fruit1.name
        elif score2 > score1:
            comparison["winner"] = fruit2.name
        else:
            comparison["winner"] = "Tie"
        
        return comparison
    
    async def get_fruit_of_the_day(self) -> Optional[Fruit]:
        """Get random fruit of the day"""
        import random
        
        result = await self.db.execute(
            select(Fruit).where(Fruit.is_active == True)
        )
        fruits = result.scalars().all()
        
        if fruits:
            return random.choice(fruits)
        return None
    
    async def get_recommendations(self, user_id: int, limit: int = 10) -> List[Fruit]:
        """Get fruit recommendations based on user history"""
        # Get user's most identified fruits
        result = await self.db.execute(
            select(Identification.fruit_name, func.count(Identification.id))
            .where(Identification.user_id == user_id)
            .group_by(Identification.fruit_name)
            .order_by(func.count(Identification.id).desc())
            .limit(5)
        )
        top_fruits = result.all()
        
        # Get fruits in same categories
        recommended = []
        for fruit_name, _ in top_fruits:
            fruit = await self.get_fruit_by_name(fruit_name)
            if fruit and fruit.category:
                cat_result = await self.db.execute(
                    select(Fruit)
                    .where(
                        Fruit.category == fruit.category,
                        Fruit.name != fruit_name,
                        Fruit.is_active == True
                    )
                    .limit(limit - len(recommended))
                )
                for f in cat_result.scalars().all():
                    if f not in recommended:
                        recommended.append(f)
        
        return recommended[:limit]
    
    async def get_trending_fruits(self, limit: int = 10) -> List[Fruit]:
        """Get trending/popular fruits"""
        result = await self.db.execute(
            select(Fruit)
            .where(Fruit.is_active == True)
            .order_by(Fruit.popularity.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get encyclopedia statistics"""
        total_result = await self.db.execute(
            select(func.count(Fruit.id)).where(Fruit.is_active == True)
        )
        total_fruits = total_result.scalar_one() or 0
        
        categories_result = await self.db.execute(
            select(func.count(Fruit.category.distinct())).where(Fruit.category.isnot(None))
        )
        total_categories = categories_result.scalar_one() or 0
        
        return {
            "total_fruits": total_fruits,
            "total_categories": total_categories,
            "most_popular": await self.get_trending_fruits(5),
        }
    
    async def get_fruits_by_origin(self, country: str, page: int, limit: int) -> Tuple[List[Fruit], int]:
        """Get fruits by origin country"""
        query = select(Fruit).where(
            Fruit.origin_countries.contains([country]),
            Fruit.is_active == True
        )
        
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        fruits = result.scalars().all()
        
        return list(fruits), total
    
    async def get_top_nutrient_fruits(self, nutrient: str, limit: int) -> List[Dict]:
        """Get top fruits for a specific nutrient"""
        # Placeholder - would query based on nutrition data
        return []
    
    async def get_health_benefits(self) -> List[str]:
        """Get list of all health benefits"""
        return [
            "Heart Health",
            "Digestive Health",
            "Immune Support",
            "Weight Management",
            "Skin Health",
            "Bone Health",
            "Brain Function",
            "Anti-inflammatory",
        ]
    
    async def generate_pdf(self, fruit: Fruit, user_id: int) -> str:
        """Generate PDF for fruit information"""
        # Placeholder - would generate actual PDF
        return f"/static/exports/fruit_{fruit.id}_{user_id}.pdf"
    
    # ==================== Helper Methods ====================
    
    def _get_category_icon(self, category: str) -> str:
        icons = {
            "Citrus": "🍊",
            "Berries": "🫐",
            "Tropical": "🥭",
            "Stone Fruits": "🍑",
            "Pome Fruits": "🍎",
            "Melons": "🍈",
            "Exotic": "🥥",
        }
        return icons.get(category, "🍎")
    
    def _get_category_color(self, category: str) -> str:
        colors = {
            "Citrus": "orange",
            "Berries": "purple",
            "Tropical": "yellow",
            "Stone Fruits": "pink",
            "Pome Fruits": "red",
            "Melons": "green",
            "Exotic": "brown",
        }
        return colors.get(category, "gray")
    
    def _get_season_icon(self, season: str) -> str:
        icons = {
            "Spring": "🌸",
            "Summer": "☀️",
            "Fall": "🍂",
            "Winter": "❄️",
        }
        return icons.get(season, "📅")
    
    def _get_season_months(self, season: str) -> List[int]:
        months = {
            "Spring": [3, 4, 5],
            "Summer": [6, 7, 8],
            "Fall": [9, 10, 11],
            "Winter": [12, 1, 2],
        }
        return months.get(season, [])
    
    def _get_season_by_month(self, month: int) -> str:
        if month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        elif month in [9, 10, 11]:
            return "Fall"
        else:
            return "Winter"
    
    def _compare_nutrition(self, nut1: Dict, nut2: Dict) -> Dict:
        """Compare nutrition between two fruits"""
        return {
            "calories": {"fruit1": nut1.get("calories") if nut1 else 0, "fruit2": nut2.get("calories") if nut2 else 0},
            "fiber": {"fruit1": nut1.get("fiber") if nut1 else 0, "fruit2": nut2.get("fiber") if nut2 else 0},
            "protein": {"fruit1": nut1.get("protein") if nut1 else 0, "fruit2": nut2.get("protein") if nut2 else 0},
            "vitamin_c": {"fruit1": nut1.get("vitaminC") if nut1 else 0, "fruit2": nut2.get("vitaminC") if nut2 else 0},
        }
    
    def _calculate_nutrition_score(self, nutrition: Dict) -> int:
        """Calculate nutrition score (simplified)"""
        if not nutrition:
            return 0
        
        score = 0
        score += min(nutrition.get("calories", 0) / 10, 10)  # Lower calories = better
        score += nutrition.get("fiber", 0) * 2
        score += nutrition.get("protein", 0) * 3
        score += nutrition.get("vitaminC", 0) / 10
        
        return int(score)