"""
Seed Database
Populates the database with initial data for testing and development
"""

import asyncio
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserStatus
from app.models.fruit import Fruit
from app.utils.logger import logger


async def seed_database() -> None:
    """
    Seed database with initial data
    """
    logger.info("Seeding database...")
    
    async with AsyncSessionLocal() as db:
        # ==================== Create Admin User ====================
        logger.info("Creating admin user...")
        
        admin_user = User(
            name="Admin User",
            email="admin@fruitai.com",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            is_email_verified=True,
            is_active=True,
            created_at=datetime.utcnow(),
        )
        db.add(admin_user)
        
        # ==================== Create Demo Users ====================
        logger.info("Creating demo users...")
        
        demo_users = [
            User(
                name="John Farmer",
                email="farmer@fruitai.com",
                hashed_password=get_password_hash("Farmer@123"),
                role=UserRole.FARMER.value,
                status=UserStatus.ACTIVE.value,
                is_email_verified=True,
                is_active=True,
                created_at=datetime.utcnow(),
            ),
            User(
                name="Jane Vendor",
                email="vendor@fruitai.com",
                hashed_password=get_password_hash("Vendor@123"),
                role=UserRole.VENDOR.value,
                status=UserStatus.ACTIVE.value,
                is_email_verified=True,
                is_active=True,
                created_at=datetime.utcnow(),
            ),
            User(
                name="Demo User",
                email="demo@fruitai.com",
                hashed_password=get_password_hash("Demo@123"),
                role=UserRole.GENERAL.value,
                status=UserStatus.ACTIVE.value,
                is_email_verified=True,
                is_active=True,
                created_at=datetime.utcnow(),
            ),
        ]
        
        for user in demo_users:
            db.add(user)
        
        # ==================== Create Fruits ====================
        logger.info("Creating fruit database...")
        
        fruits_data = [
            {
                "name": "Apple",
                "scientific_name": "Malus domestica",
                "category": "Pome Fruits",
                "emoji": "🍎",
                "season": "Fall",
                "peak_months": [9, 10, 11],
                "nutrition": {
                    "calories": 52,
                    "carbs": "14g",
                    "protein": "0.3g",
                    "fat": "0.2g",
                    "fiber": "2.4g",
                    "vitaminC": "4.6mg",
                },
                "benefits": [
                    "Rich in antioxidants",
                    "Supports heart health",
                    "Good for digestion",
                ],
                "storage_tips": "Store in refrigerator for longer freshness",
                "fun_facts": ["Apples float in water because they are 25% air"],
                "origin_countries": ["China", "USA", "Poland"],
                "popularity": 100,
            },
            {
                "name": "Banana",
                "scientific_name": "Musa acuminata",
                "category": "Tropical",
                "emoji": "🍌",
                "season": "Year-round",
                "peak_months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                "nutrition": {
                    "calories": 89,
                    "carbs": "23g",
                    "protein": "1.1g",
                    "fat": "0.3g",
                    "fiber": "2.6g",
                    "vitaminC": "8.7mg",
                    "potassium": "358mg",
                },
                "benefits": [
                    "High in potassium",
                    "Good for energy",
                    "Supports digestive health",
                ],
                "storage_tips": "Store at room temperature, refrigerate when ripe",
                "fun_facts": ["Bananas are technically berries"],
                "origin_countries": ["India", "China", "Indonesia"],
                "popularity": 95,
            },
            {
                "name": "Orange",
                "scientific_name": "Citrus sinensis",
                "category": "Citrus",
                "emoji": "🍊",
                "season": "Winter",
                "peak_months": [12, 1, 2, 3],
                "nutrition": {
                    "calories": 47,
                    "carbs": "12g",
                    "protein": "0.9g",
                    "fat": "0.1g",
                    "fiber": "2.4g",
                    "vitaminC": "53mg",
                },
                "benefits": [
                    "Excellent source of Vitamin C",
                    "Boosts immune system",
                    "Good for skin health",
                ],
                "storage_tips": "Store at room temperature or refrigerate",
                "fun_facts": ["Oranges are actually modified berries"],
                "origin_countries": ["Brazil", "USA", "Mexico"],
                "popularity": 90,
            },
            {
                "name": "Mango",
                "scientific_name": "Mangifera indica",
                "category": "Tropical",
                "emoji": "🥭",
                "season": "Summer",
                "peak_months": [5, 6, 7, 8],
                "nutrition": {
                    "calories": 60,
                    "carbs": "15g",
                    "protein": "0.8g",
                    "fat": "0.4g",
                    "fiber": "1.6g",
                    "vitaminC": "36mg",
                    "vitaminA": "1080IU",
                },
                "benefits": [
                    "Rich in Vitamin A",
                    "Boosts immunity",
                    "Good for eye health",
                ],
                "storage_tips": "Ripen at room temperature, then refrigerate",
                "fun_facts": ["Mangoes are the national fruit of India"],
                "origin_countries": ["India", "China", "Thailand"],
                "popularity": 85,
            },
            {
                "name": "Strawberry",
                "scientific_name": "Fragaria × ananassa",
                "category": "Berries",
                "emoji": "🍓",
                "season": "Spring",
                "peak_months": [4, 5, 6],
                "nutrition": {
                    "calories": 32,
                    "carbs": "7.7g",
                    "protein": "0.7g",
                    "fat": "0.3g",
                    "fiber": "2g",
                    "vitaminC": "59mg",
                },
                "benefits": [
                    "High in Vitamin C",
                    "Rich in antioxidants",
                    "Good for heart health",
                ],
                "storage_tips": "Refrigerate and eat within a few days",
                "fun_facts": ["Strawberries are the only fruit with seeds on the outside"],
                "origin_countries": ["USA", "Mexico", "Spain"],
                "popularity": 88,
            },
            {
                "name": "Watermelon",
                "scientific_name": "Citrullus lanatus",
                "category": "Melons",
                "emoji": "🍉",
                "season": "Summer",
                "peak_months": [6, 7, 8],
                "nutrition": {
                    "calories": 30,
                    "carbs": "8g",
                    "protein": "0.6g",
                    "fat": "0.2g",
                    "fiber": "0.4g",
                    "vitaminC": "8mg",
                },
                "benefits": [
                    "Hydrating",
                    "Low in calories",
                    "Good source of lycopene",
                ],
                "storage_tips": "Store whole at room temperature, refrigerate after cutting",
                "fun_facts": ["Watermelons are 92% water"],
                "origin_countries": ["China", "Turkey", "Iran"],
                "popularity": 82,
            },
            {
                "name": "Grapes",
                "scientific_name": "Vitis vinifera",
                "category": "Berries",
                "emoji": "🍇",
                "season": "Fall",
                "peak_months": [8, 9, 10],
                "nutrition": {
                    "calories": 69,
                    "carbs": "18g",
                    "protein": "0.7g",
                    "fat": "0.2g",
                    "fiber": "0.9g",
                    "vitaminC": "3.2mg",
                },
                "benefits": [
                    "Rich in antioxidants",
                    "Good for heart health",
                    "Contains resveratrol",
                ],
                "storage_tips": "Refrigerate and wash before eating",
                "fun_facts": ["Grapes can be turned into raisins, wine, and juice"],
                "origin_countries": ["China", "Italy", "USA"],
                "popularity": 80,
            },
            {
                "name": "Pineapple",
                "scientific_name": "Ananas comosus",
                "category": "Tropical",
                "emoji": "🍍",
                "season": "Spring",
                "peak_months": [3, 4, 5, 6],
                "nutrition": {
                    "calories": 50,
                    "carbs": "13g",
                    "protein": "0.5g",
                    "fat": "0.1g",
                    "fiber": "1.4g",
                    "vitaminC": "48mg",
                },
                "benefits": [
                    "Contains bromelain",
                    "Good for digestion",
                    "Rich in Vitamin C",
                ],
                "storage_tips": "Store at room temperature, refrigerate after cutting",
                "fun_facts": ["Pineapples take about 18 months to grow"],
                "origin_countries": ["Costa Rica", "Brazil", "Philippines"],
                "popularity": 78,
            },
        ]
        
        for fruit_data in fruits_data:
            fruit = Fruit(**fruit_data)
            db.add(fruit)
        
        # Commit all changes
        await db.commit()
        
        logger.info(f"Database seeded successfully!")
        logger.info(f"  - Users: {len(demo_users) + 1}")
        logger.info(f"  - Fruits: {len(fruits_data)}")


if __name__ == "__main__":
    asyncio.run(seed_database())