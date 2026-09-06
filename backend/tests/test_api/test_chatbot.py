"""
Chatbot API Tests
"""

import pytest
from httpx import AsyncClient


class TestChatbotAPI:
    """Test chatbot endpoints"""
    
    async def test_send_message(self, client: AsyncClient):
        """Test send message to chatbot"""
        response = await client.post(
            "/api/v1/chatbot/message",
            json={
                "message": "Hello, what fruits are in season?",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "session_id" in data
    
    async def test_get_suggestions(self, client: AsyncClient):
        """Test get suggested questions"""
        response = await client.get("/api/v1/chatbot/suggestions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_faqs(self, client: AsyncClient):
        """Test get FAQs"""
        response = await client.get("/api/v1/chatbot/faqs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)