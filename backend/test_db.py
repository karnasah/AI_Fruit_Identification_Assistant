import asyncio
import sys
import os

# Add the current directory to sys.path to find 'app'
sys.path.append(os.getcwd())

from app.core.database import get_async_engine
from sqlalchemy import text

async def test_data():
    try:
        engine = await get_async_engine()
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT count(*) FROM fruits"))
            count = result.scalar()
            print(f"Fruit count: {count}")
            
            if count > 0:
                result = await conn.execute(text("SELECT name, category, season FROM fruits LIMIT 5"))
                fruits = result.fetchall()
                print("Sample fruits:")
                for f in fruits:
                    print(f" - {f[0]} ({f[1]}, {f[2]})")
            else:
                print("Database is empty. You might need to seed it.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_data())
