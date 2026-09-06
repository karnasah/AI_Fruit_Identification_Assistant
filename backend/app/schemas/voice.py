"""
Voice Schemas
Pydantic models for voice processing
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class SpeechToTextResponse(BaseModel):
    """Speech to text response"""
    transcript: str
    language: str = "en-US"
    confidence: float = 0.0
    history_id: Optional[int] = None


class TextToSpeechResponse(BaseModel):
    """Text to speech response"""
    audio_base64: str
    format: str = "mp3"
    duration: float = 0.0


class VoiceCommandRequest(BaseModel):
    """Voice command request"""
    command: str = Field(..., min_length=1, max_length=200)


class VoiceCommandResponse(BaseModel):
    """Voice command response"""
    command: str
    action: str
    success: bool
    message: str
    data: Optional[dict] = None


class VoicePreferences(BaseModel):
    """Voice preferences"""
    voice_input: bool = True
    voice_output: bool = False
    voice_language: str = "en-US"
    voice_speed: float = 1.0
    voice_pitch: float = 1.0


class VoicePreferencesUpdate(BaseModel):
    """Voice preferences update"""
    voice_input: Optional[bool] = None
    voice_output: Optional[bool] = None
    voice_language: Optional[str] = None
    voice_speed: Optional[float] = Field(None, ge=0.5, le=2.0)
    voice_pitch: Optional[float] = Field(None, ge=0.5, le=2.0)


class MessageResponse(BaseModel):
    """Message response"""
    message: str
    data: Optional[dict] = None
