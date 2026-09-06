"""
Authentication API Tests
"""

import pytest
from httpx import AsyncClient


class TestAuthAPI:
    """Test authentication endpoints"""
    
    async def test_register(self, client: AsyncClient):
        """Test user registration"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "password": "Test@123",
                "role": "general",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
    
    async def test_login(self, client: AsyncClient):
        """Test user login"""
        # First register
        await client.post(
            "/api/v1/auth/register",
            json={
                "name": "Login User",
                "email": "login@example.com",
                "password": "Login@123",
                "role": "general",
            }
        )
        
        # Then login
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "login@example.com",
                "password": "Login@123",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials"""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrong",
            }
        )
        assert response.status_code == 401