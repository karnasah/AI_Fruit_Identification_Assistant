"""
Fruit Service
Handles fruit encyclopedia, identification history, and favorites management
"""

from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.models.fruit import Fruit
from app.models.favorite import Favorite
from app.models.identification import Identification
from app.schemas.fruit import FruitCreate, FruitUpdate
from app.utils.fruit_labels import clean_fruit_label
from app.utils.logger import logger


class FruitService:
    """Service for fruit-related operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ==================== Fruit Encyclopedia ====================
    
    async def get_all_fruits(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        season: Optional[str] = None,
        sort: str = "name",
        order: str = "asc",
    ) -> Tuple[List[Fruit], int]:
        """Get all fruits with pagination and filters"""
        query = select(Fruit).where(Fruit.is_active == True)
        
        # Apply filters
        if search:
            query = query.where(
                Fruit.name.ilike(f"%{search}%") | 
                Fruit.scientific_name.ilike(f"%{search}%")
            )
        if category:
            query = query.where(Fruit.category == category)
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
            order_by = Fruit.nutrition['calories'].asc() if order == "asc" else Fruit.nutrition['calories'].desc()
        elif sort == "popularity":
            order_by = Fruit.popularity.desc()
        else:
            order_by = Fruit.name.asc()
        
        query = query.order_by(order_by)
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        
        result = await self.db.execute(query)
        fruits = result.scalars().all()
        
        return list(fruits), total
    
    async def get_fruit_by_id(self, fruit_id: int) -> Optional[Fruit]:
        """Get fruit by ID"""
        result = await self.db.execute(
            select(Fruit).where(Fruit.id == fruit_id, Fruit.is_active == True)
        )
        return result.scalar_one_or_none()
    
    async def get_fruit_by_name(self, name: str) -> Optional[Fruit]:
        """Get fruit by name"""
        result = await self.db.execute(
            select(Fruit).where(Fruit.name.ilike(name), Fruit.is_active == True)
        )
        return result.scalar_one_or_none()
    
    async def create_fruit(self, fruit_data: FruitCreate) -> Fruit:
        """Create a new fruit"""
        fruit = Fruit(**fruit_data.model_dump())
        self.db.add(fruit)
        await self.db.commit()
        await self.db.refresh(fruit)
        logger.info(f"Fruit created: {fruit.name}")
        return fruit
    
    async def update_fruit(self, fruit_id: int, fruit_data: FruitUpdate) -> Optional[Fruit]:
        """Update fruit information"""
        fruit = await self.get_fruit_by_id(fruit_id)
        if not fruit:
            return None
        
        update_data = fruit_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(fruit, key, value)
        
        fruit.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(fruit)
        logger.info(f"Fruit updated: {fruit.name}")
        return fruit
    
    async def delete_fruit(self, fruit_id: int) -> bool:
        """Soft delete fruit"""
        fruit = await self.get_fruit_by_id(fruit_id)
        if not fruit:
            return False
        
        fruit.is_active = False
        await self.db.commit()
        logger.info(f"Fruit deleted: {fruit.name}")
        return True
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Get all fruit categories with counts"""
        result = await self.db.execute(
            select(Fruit.category, func.count(Fruit.id))
            .where(Fruit.is_active == True)
            .group_by(Fruit.category)
        )
        categories = result.all()
        return [{"name": cat[0], "count": cat[1]} for cat in categories if cat[0]]
    
    async def get_fruits_by_season(self, season: str) -> List[Fruit]:
        """Get fruits by season"""
        result = await self.db.execute(
            select(Fruit).where(Fruit.season == season, Fruit.is_active == True)
        )
        return result.scalars().all()
    
    # ==================== Favorites ====================
    
    async def get_user_favorites(self, user_id: int) -> List[Favorite]:
        """Get user's favorite fruits"""
        result = await self.db.execute(
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .options(selectinload(Favorite.fruit))
            .order_by(Favorite.created_at.desc())
        )
        return result.scalars().all()
    
    async def is_favorite(self, user_id: int, fruit_id: int) -> bool:
        """Check if fruit is in user's favorites"""
        result = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.fruit_id == fruit_id
            )
        )
        return result.scalar_one_or_none() is not None
    
    async def add_to_favorites(self, user_id: int, fruit_id: int, notes: Optional[str] = None) -> Favorite:
        """Add fruit to user's favorites"""
        favorite = Favorite(
            user_id=user_id,
            fruit_id=fruit_id,
            notes=notes,
            created_at=datetime.utcnow()
        )
        self.db.add(favorite)
        
        # Increment fruit popularity
        fruit = await self.get_fruit_by_id(fruit_id)
        if fruit:
            fruit.popularity += 1
        
        await self.db.commit()
        await self.db.refresh(favorite)
        logger.info(f"Fruit {fruit_id} added to favorites for user {user_id}")
        return favorite
    
    async def remove_from_favorites(self, user_id: int, fruit_id: int) -> bool:
        """Remove fruit from user's favorites"""
        result = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.fruit_id == fruit_id
            )
        )
        favorite = result.scalar_one_or_none()
        
        if not favorite:
            return False
        
        await self.db.delete(favorite)
        
        # Decrement fruit popularity
        fruit = await self.get_fruit_by_id(fruit_id)
        if fruit and fruit.popularity > 0:
            fruit.popularity -= 1
        
        await self.db.commit()
        logger.info(f"Fruit {fruit_id} removed from favorites for user {user_id}")
        return True
    
    # ==================== Identification History ====================
    
    async def save_identification_history(
        self,
        user_id: int,
        fruit_name: str,
        confidence: float,
        image_path: Optional[str] = None,
        top_predictions: Optional[List[Dict]] = None,
        ripeness: Optional[str] = None,
        fruit_id: Optional[int] = None,
    ) -> Identification:
        """Save identification to history"""
        fruit_name = clean_fruit_label(fruit_name)
        top_predictions = [
            {**prediction, "name": clean_fruit_label(prediction["name"])}
            for prediction in (top_predictions or [])
        ]

        # Try to find fruit by name
        if not fruit_id:
            fruit = await self.get_fruit_by_name(fruit_name)
            if fruit:
                fruit_id = fruit.id
        
        identification = Identification(
            user_id=user_id,
            fruit_id=fruit_id,
            fruit_name=fruit_name,
            confidence=confidence,
            image_path=image_path,
            top_predictions=top_predictions,
            ripeness=ripeness,
            created_at=datetime.utcnow(),
        )
        
        self.db.add(identification)
        
        # Increment fruit popularity if fruit exists
        if fruit_id:
            fruit = await self.get_fruit_by_id(fruit_id)
            if fruit:
                fruit.popularity += 1
        
        await self.db.commit()
        await self.db.refresh(identification)
        
        return identification
    
    async def get_user_history(
        self,
        user_id: int,
        page: int = 1,
        limit: int = 20,
        fruit_name: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> Tuple[List[Identification], int]:
        """Get user's identification history"""
        query = select(Identification).where(Identification.user_id == user_id)
        
        if fruit_name:
            query = query.where(Identification.fruit_name.ilike(f"%{fruit_name}%"))
        
        if date_from:
            query = query.where(Identification.created_at >= date_from)
        if date_to:
            query = query.where(Identification.created_at <= date_to)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.execute(count_query)
        total = total.scalar_one()
        
        query = query.order_by(desc(Identification.created_at))
        query = query.offset((page - 1) * limit).limit(limit)
        
        result = await self.db.execute(query)
        history = result.scalars().all()
        
        return list(history), total
    
    async def get_identification_by_id(self, identification_id: int, user_id: int) -> Optional[Identification]:
        """Get identification by ID"""
        result = await self.db.execute(
            select(Identification).where(
                Identification.id == identification_id,
                Identification.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def delete_identification(self, identification_id: int, user_id: int) -> bool:
        """Delete identification record"""
        identification = await self.get_identification_by_id(identification_id, user_id)
        if not identification:
            return False
        
        await self.db.delete(identification)
        await self.db.commit()
        return True
    
    async def clear_all_history(self, user_id: int) -> None:
        """Clear all identification history for user"""
        result = await self.db.execute(
            select(Identification).where(Identification.user_id == user_id)
        )
        histories = result.scalars().all()
        
        for history in histories:
            await self.db.delete(history)
        
        await self.db.commit()
        logger.info(f"Cleared all identification history for user {user_id}")
    
    async def get_user_statistics(self, user_id: int) -> Dict[str, Any]:
        """Get user's identification statistics"""
        # Total identifications
        total_result = await self.db.execute(
            select(func.count(Identification.id)).where(Identification.user_id == user_id)
        )
        total = total_result.scalar_one() or 0
        
        # Unique fruits
        unique_result = await self.db.execute(
            select(func.count(Identification.fruit_name.distinct())).where(
                Identification.user_id == user_id
            )
        )
        unique = unique_result.scalar_one() or 0
        
        # Most identified fruits
        most_result = await self.db.execute(
            select(Identification.fruit_name, func.count(Identification.id))
            .where(Identification.user_id == user_id)
            .group_by(Identification.fruit_name)
            .order_by(func.count(Identification.id).desc())
            .limit(5)
        )
        most_identified = [{"name": name, "count": count} for name, count in most_result.all()]
        
        return {
            "total": total,
            "unique_fruits": unique,
            "most_identified": most_identified,
        }