"""
Fruits API Tests
"""

import pytest
from httpx import AsyncClient


class TestFruitsAPI:
    """Test fruits endpoints"""
    
    async def test_get_fruits(self, client: AsyncClient):
        """Test get all fruits"""
        response = await client.get("/api/v1/encyclopedia/fruits")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
    
    async def test_get_fruit_by_name(self, client: AsyncClient):
        """Test get fruit by name"""
        response = await client.get("/api/v1/encyclopedia/fruits/Apple")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Apple"
    
    async def test_search_fruits(self, client: AsyncClient):
        """Test search fruits"""
        response = await client.get("/api/v1/encyclopedia/search?q=app")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
    
    async def test_get_categories(self, client: AsyncClient):
        """Test get fruit categories"""
        response = await client.get("/api/v1/encyclopedia/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)