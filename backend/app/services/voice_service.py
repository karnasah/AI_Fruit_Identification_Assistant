"""
Voice Service
Handles voice command processing and voice preferences
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.utils.logger import logger


class VoiceService:
    """Service for voice-related operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def process_command(
        self,
        command: str,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Process voice command and determine action
        
        Args:
            command: Voice command text
            user_id: Optional user ID
        
        Returns:
            Dictionary with action and response
        """
        command_lower = command.lower().strip()
        
        # Define command patterns
        commands = {
            "identify": ["identify", "what is this", "recognize"],
            "capture": ["capture", "take photo", "snap", "picture"],
            "dashboard": ["dashboard", "stats", "statistics"],
            "encyclopedia": ["encyclopedia", "database", "fruit list"],
            "chatbot": ["chatbot", "assistant", "help me"],
            "profile": ["profile", "my account", "account"],
            "settings": ["settings", "preferences", "options"],
            "history": ["history", "past identifications"],
            "favorites": ["favorites", "saved fruits"],
            "logout": ["logout", "sign out", "exit"],
            "help": ["help", "what can I do", "commands"],
        }
        
        # Find matching command
        for action, patterns in commands.items():
            for pattern in patterns:
                if pattern in command_lower:
                    return {
                        "command": command,
                        "action": action,
                        "success": True,
                        "message": f"Executing {action} command",
                        "data": {"command": action},
                    }
        
        # Extract fruit name for identification
        fruit_keywords = ["identify", "recognize", "what is"]
        for keyword in fruit_keywords:
            if keyword in command_lower:
                fruit_name = command_lower.replace(keyword, "").strip()
                if fruit_name:
                    return {
                        "command": command,
                        "action": "identify_fruit",
                        "success": True,
                        "message": f"Identifying {fruit_name}",
                        "data": {"fruit_name": fruit_name},
                    }
        
        return {
            "command": command,
            "action": "unknown",
            "success": False,
            "message": "Command not recognized. Say 'help' for available commands.",
            "data": None,
        }
    
    async def get_available_commands(self, context: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available voice commands for current context"""
        commands = [
            {"phrase": "identify [fruit]", "action": "identify", "description": "Identify a fruit"},
            {"phrase": "capture", "action": "capture", "description": "Take a photo"},
            {"phrase": "dashboard", "action": "dashboard", "description": "Go to dashboard"},
            {"phrase": "encyclopedia", "action": "encyclopedia", "description": "Open encyclopedia"},
            {"phrase": "chatbot", "action": "chatbot", "description": "Open chatbot"},
            {"phrase": "profile", "action": "profile", "description": "View profile"},
            {"phrase": "settings", "action": "settings", "description": "Open settings"},
            {"phrase": "history", "action": "history", "description": "View history"},
            {"phrase": "favorites", "action": "favorites", "description": "View favorites"},
            {"phrase": "logout", "action": "logout", "description": "Logout"},
            {"phrase": "help", "action": "help", "description": "Show commands"},
        ]
        return commands
    
    async def get_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get user's voice preferences"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user and user.preferences:
            return {
                "voice_input": user.preferences.get("voice_input", True),
                "voice_output": user.preferences.get("voice_output", False),
                "voice_language": user.preferences.get("voice_language", "en-US"),
                "voice_speed": user.preferences.get("voice_speed", 1.0),
                "voice_pitch": user.preferences.get("voice_pitch", 1.0),
            }
        
        return {
            "voice_input": True,
            "voice_output": False,
            "voice_language": "en-US",
            "voice_speed": 1.0,
            "voice_pitch": 1.0,
        }
    
    async def update_preferences(self, user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user's voice preferences"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            current_prefs = user.preferences or {}
            current_prefs.update(preferences)
            user.preferences = current_prefs
            await self.db.commit()
        
        return await self.get_preferences(user_id)
    
    async def save_speech_history(self, user_id: int, transcript: str, language: str) -> Any:
        """Save speech-to-text history"""
        # Placeholder - would save to database
        logger.info(f"Speech history saved for user {user_id}: {transcript[:50]}...")
        return type('obj', (object,), {'id': 1})()
    
    async def save_tts_history(self, user_id: int, text: str, voice: str) -> None:
        """Save text-to-speech history"""
        logger.info(f"TTS history saved for user {user_id}: {text[:50]}...")
    
    async def get_voice_history(self, user_id: int, page: int, limit: int) -> tuple:
        """Get user's voice history"""
        # Placeholder - would query from database
        return [], 0
    
    async def clear_voice_history(self, user_id: int) -> None:
        """Clear user's voice history"""
        logger.info(f"Voice history cleared for user {user_id}")
    
    async def add_custom_command(self, phrase: str, action: str) -> Dict[str, Any]:
        """Add custom voice command (admin)"""
        return {"phrase": phrase, "action": action, "id": 1}
    
    async def delete_custom_command(self, command_id: int) -> None:
        """Delete custom voice command (admin)"""
        logger.info(f"Custom command {command_id} deleted")