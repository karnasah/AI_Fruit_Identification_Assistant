"""
Voice API Endpoints
Speech-to-text, text-to-speech, and voice command processing
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_active_user, get_db_session
from app.schemas.voice import (
    SpeechToTextResponse,
    TextToSpeechResponse,
    VoiceCommandRequest,
    VoiceCommandResponse,
    VoicePreferences,
    VoicePreferencesUpdate,
    MessageResponse,
)
from app.services.voice_service import VoiceService
from app.services.speech_service import SpeechService
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/voice", tags=["Voice"])


# ========================================
# Speech-to-Text
# ========================================

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form("en-US"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Convert speech audio to text
    """
    # Validate file
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an audio file.",
        )
    
    current_user = await get_current_user(None, db)  # None credentials for optional
    
    speech_service = SpeechService()
    
    try:
        # Process audio
        transcript = await speech_service.speech_to_text(audio, language)
        
        # Save to history if user authenticated
        history_id = None
        if current_user:
            voice_service = VoiceService(db)
            history = await voice_service.save_speech_history(
                user_id=current_user.id,
                transcript=transcript,
                language=language,
            )
            history_id = history.id
        
        return SpeechToTextResponse(
            transcript=transcript,
            language=language,
            confidence=0.95,  # Would come from actual service
            history_id=history_id,
        )
        
    except Exception as e:
        logger.error(f"Speech-to-text error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech recognition failed: {str(e)}",
        )


# ========================================
# Text-to-Speech
# ========================================

@router.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("en-US-Neural2-F"),
    speed: float = Form(1.0),
    pitch: float = Form(1.0),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Convert text to speech audio
    """
    if not text or len(text) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text must be between 1 and 500 characters",
        )
    
    current_user = await get_current_user(None, db)
    
    speech_service = SpeechService()
    
    try:
        # Generate audio
        audio_data = await speech_service.text_to_speech(text, voice, speed, pitch)
        
        # Save to history if user authenticated
        if current_user:
            voice_service = VoiceService(db)
            await voice_service.save_tts_history(
                user_id=current_user.id,
                text=text,
                voice=voice,
            )
        
        return TextToSpeechResponse(
            audio_base64=audio_data,
            format="mp3",
            duration=len(text) / 10,  # Approximate duration
        )
        
    except Exception as e:
        logger.error(f"Text-to-speech error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failed: {str(e)}",
        )


# ========================================
# Voice Command Processing
# ========================================

@router.post("/process-command", response_model=VoiceCommandResponse)
async def process_voice_command(
    request: VoiceCommandRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Process a voice command and execute corresponding action
    """
    voice_service = VoiceService(db)
    
    # Process command
    result = await voice_service.process_command(
        command=request.command,
        user_id=current_user.id if current_user else None,
    )
    
    return VoiceCommandResponse(
        command=request.command,
        action=result.action,
        success=result.success,
        message=result.message,
        data=result.data,
    )


# Other endpoints follow the same pattern...

@router.get("/commands", response_model=List[dict])
async def get_voice_commands(
    context: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Get available voice commands for the current context
    """
    voice_service = VoiceService(db)
    
    commands = await voice_service.get_available_commands(context)
    
    return commands


@router.post("/commands", response_model=dict)
async def add_custom_command(
    phrase: str,
    action: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Add a custom voice command (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    voice_service = VoiceService(db)
    command = await voice_service.add_custom_command(phrase, action)
    
    return command


# [Continue with similar pattern for all other endpoints - using direct Depends(get_current_user) and get_current_active_user without Annotated aliases]

# Voice Preferences
@router.get("/preferences", response_model=VoicePreferences)
async def get_voice_preferences(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    voice_service = VoiceService(db)
    
    preferences = await voice_service.get_preferences(current_user.id)
    
    return VoicePreferences.model_validate(preferences)


@router.post("/preferences", response_model=VoicePreferences)
async def save_voice_preferences(
    preferences: VoicePreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    voice_service = VoiceService(db)
    
    updated = await voice_service.update_preferences(
        user_id=current_user.id,
        preferences=preferences.dict(exclude_unset=True),
    )
    
    return VoicePreferences.model_validate(updated)


@router.get("/history", response_model=List[dict])
async def get_voice_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
    page: int = 1,
    limit: int = 20,
):
    voice_service = VoiceService(db)
    
    history, total = await voice_service.get_voice_history(
        user_id=current_user.id,
        page=page,
        limit=limit,
    )
    
    return {
        "history": history,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.delete("/history", response_model=MessageResponse)
async def clear_voice_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    voice_service = VoiceService(db)
    
    await voice_service.clear_voice_history(current_user.id)
    
    return MessageResponse(message="Voice history cleared")


@router.get("/voices", response_model=List[dict])
async def get_available_voices(
    language: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
):
    speech_service = SpeechService()
    
    voices = await speech_service.get_available_voices(language)
    
    return voices


@router.get("/languages", response_model=List[dict])
async def get_supported_languages(
    current_user: Optional[User] = Depends(get_current_user),
):
    speech_service = SpeechService()
    
    languages = await speech_service.get_supported_languages()
    
    return languages


@router.post("/detect-language", response_model=dict)
async def detect_language(
    audio: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user),
):
    speech_service = SpeechService()
    
    language, confidence = await speech_service.detect_language(audio)
    
    return {
        "language": language,
        "confidence": confidence,
    }


@router.delete("/commands/{command_id}", response_model=MessageResponse)
async def delete_custom_command(
    command_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Delete a custom voice command (admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    voice_service = VoiceService(db)
    await voice_service.delete_custom_command(command_id)
    
    return MessageResponse(message="Command deleted")

