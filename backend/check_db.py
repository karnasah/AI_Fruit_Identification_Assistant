import asyncio
import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.models.fruit import Fruit
from app.models.user import User
from app.models.identification import Identification
from sqlalchemy import select

async def check_db():
    print("Checking database...")
    async with AsyncSessionLocal() as session:
        # Check fruits
        fruits_res = await session.execute(select(Fruit))
        fruits = fruits_res.scalars().all()
        print(f"Fruits: {len(fruits)}")
        for f in fruits[:5]:
            print(f" - {f.name} ({f.category})")

        # Check users
        users_res = await session.execute(select(User))
        users = users_res.scalars().all()
        print(f"Users: {len(users)}")
        for u in users[:5]:
            print(f" - {u.name} ({u.email}, role={u.role})")

        # Check identifications
        ident_res = await session.execute(select(Identification))
        idents = ident_res.scalars().all()
        print(f"Identifications: {len(idents)}")

if __name__ == "__main__":
    asyncio.run(check_db())
