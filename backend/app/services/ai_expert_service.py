"""AI Expert Analysis service using fruit classification and Gemini."""

import base64
import json
from typing import Any, Dict, List

from app.core.config import settings
from app.services.ml_service import MLService
from app.utils.logger import logger


class AIExpertService:
    """Coordinates local fruit identification with Gemini analysis."""

    MODEL_NAME = "gemini-3.6-flash"
    RESULT_KEYS = (
        "fruit_name",
        "disease_analysis",
        "ripeness",
        "quality",
        "recommendations",
        "nutrition",
        "storage_tips",
    )

    async def analyze(
        self,
        image_bytes: bytes,
        mime_type: str,
        analysis_types: List[str],
        image_path: str,
    ) -> Dict[str, Any]:
        logger.info(
            "AI expert analysis started: image_bytes=%d mime_type=%s analysis_types=%s image_path=%s",
            len(image_bytes),
            mime_type,
            analysis_types,
            image_path,
        )
        identification = await MLService().identify_fruit(image_path)
        logger.info("Local fruit identification completed: %s", identification)
        api_key = settings.GEMINI_API_KEY
        logger.info("GEMINI_API_KEY loaded: %s (length=%d)", bool(api_key), len(api_key or ""))
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        requested = analysis_types or list(self.RESULT_KEYS)
        prompt = (
            "Analyze this fruit image as an agricultural and nutrition expert. "
            "Return only valid JSON with exactly these keys: "
            "fruit_name, disease_analysis, ripeness, quality, recommendations, "
            "nutrition, storage_tips. Each value should be useful concise text "
            "or a JSON object/array where appropriate. Cover only the requested "
            f"analysis areas: {', '.join(requested)}. "
            f"The local fruit classifier predicted: {json.dumps(identification)}."
        )
        contents = [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {"inline_data": {
                    "mime_type": mime_type,
                    "data": base64.b64encode(image_bytes).decode("ascii"),
                }},
            ],
        }]
        payload = {
            "contents": contents,
            "generationConfig": {"responseMimeType": "application/json"},
        }
        logger.info(
            "Gemini request prepared: model=%s endpoint=%s payload_keys=%s content_parts=%d image_bytes=%d",
            self.MODEL_NAME,
            "https://generativelanguage.googleapis.com/v1beta/models/" + self.MODEL_NAME + ":generateContent",
            list(payload),
            len(contents[0]["parts"]),
            len(image_bytes),
        )
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.MODEL_NAME}:generateContent?key={api_key}"
        )
        try:
            import httpx
        except ImportError as exc:
            logger.exception("Gemini HTTP client import failed")
            raise RuntimeError("Gemini HTTP client is not installed") from exc
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(endpoint, json=payload)
            logger.info(
                "Gemini response received: status=%d content_type=%s body=%s",
                response.status_code,
                response.headers.get("content-type"),
                response.text[:2000],
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError:
                logger.error(
                    "Gemini request failed: status=%d body=%s",
                    response.status_code,
                    response.text[:2000],
                )
                raise

        response_json = response.json()
        logger.info("Gemini response JSON keys: %s", list(response_json))
        candidates = response_json.get("candidates", [])
        if not candidates:
            raise RuntimeError("Gemini returned no analysis candidates")
        parts = candidates[0].get("content", {}).get("parts", [])
        text = next((part.get("text") for part in parts if part.get("text")), None)
        if not text:
            raise RuntimeError("Gemini returned an empty analysis")
        try:
            analysis = json.loads(text)
        except json.JSONDecodeError as exc:
            logger.exception("Gemini response JSON parsing failed: %s", text[:2000])
            raise RuntimeError("Gemini returned invalid JSON") from exc
        if not isinstance(analysis, dict):
            raise RuntimeError("Gemini analysis was not a JSON object")
        return self._normalize_result(analysis, identification)

    def _normalize_result(
        self, analysis: Dict[str, Any], identification: Dict[str, Any]
    ) -> Dict[str, Any]:
        result = {key: analysis.get(key, "Not available") for key in self.RESULT_KEYS}
        if result["fruit_name"] == "Not available":
            result["fruit_name"] = identification.get("fruit_name", "Unknown")
        result["identification"] = identification
        return result