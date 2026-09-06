"""AI Expert Analysis API endpoints."""

import json
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.services.ai_expert_service import AIExpertService
from app.services.file_service import FileService
from app.utils.logger import logger

router = APIRouter(prefix="/ai", tags=["AI Expert"])


@router.post("/expert-analysis")
async def expert_analysis(
    image: UploadFile = File(...),
    analysis_types: Optional[str] = Form(None),
):
    """Identify the fruit locally, then request expert analysis from Gemini."""
    logger.info(
        "AI expert request received: filename=%s content_type=%s analysis_types=%s",
        image.filename,
        image.content_type,
        analysis_types,
    )
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload an image.")

    file_service = FileService()
    if await file_service.get_file_size(image) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large. Maximum size is 10MB.")

    try:
        image_bytes = await image.read()
        logger.info("AI expert image read: bytes=%d", len(image_bytes))
        image.file.seek(0)
        image_path = await file_service.save_temp_file(image)
        logger.info("AI expert temporary image saved: path=%s", image_path)
        try:
            requested = json.loads(analysis_types) if analysis_types else []
            if not isinstance(requested, list) or not all(isinstance(item, str) for item in requested):
                raise ValueError("analysis_types must be a JSON array of strings")
            logger.info("AI expert analysis types parsed: %s", requested)
            return await AIExpertService().analyze(
                image_bytes=image_bytes,
                mime_type=image.content_type,
                analysis_types=requested,
                image_path=image_path,
            )
        finally:
            await file_service.delete_temp_file(image_path)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("AI expert analysis error: type=%s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI expert analysis failed.") from exc