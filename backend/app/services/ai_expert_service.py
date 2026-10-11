"""AI Expert Analysis service using an external vision analysis API."""

import base64
import asyncio
import json
from typing import Any, Dict, List

from app.core.config import settings
from app.utils.logger import logger


class AIExpertService:
    """Sends the uploaded image directly to the external analysis API."""

    MODEL_NAME = settings.GEMINI_MODEL
    MAX_ATTEMPTS = 3
    REQUEST_TIMEOUT_SECONDS = 60.0
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
    ) -> Dict[str, Any]:
        logger.info(
            "AI expert analysis started: image_bytes=%d mime_type=%s analysis_types=%s",
            len(image_bytes),
            mime_type,
            analysis_types,
        )
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        requested = analysis_types or list(self.RESULT_KEYS)
        prompt = (
            "Analyze this fruit image as an agricultural and nutrition expert. "
            "Return only valid JSON with exactly these keys: "
            "fruit_name, disease_analysis, ripeness, quality, recommendations, "
            "nutrition, storage_tips. Each value should be useful concise text "
            "or a JSON object/array where appropriate. Cover only the requested "
            f"analysis areas: {', '.join(requested)}. Base every conclusion on "
            "the uploaded image. Do not assume a fruit type that is not visible."
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
            "AI expert request prepared: model=%s endpoint=%s payload_keys=%s content_parts=%d image_bytes=%d",
            self.MODEL_NAME,
            "https://generativelanguage.googleapis.com/v1beta/models/" + self.MODEL_NAME + ":generateContent",
            list(payload),
            len(contents[0]["parts"]),
            len(image_bytes),
        )
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.MODEL_NAME}:generateContent"
        )
        request_headers = {"x-goog-api-key": api_key}
        safe_headers = {"x-goog-api-key": "<redacted>"}
        try:
            import httpx
        except ImportError as exc:
            logger.exception("AI expert HTTP client import failed")
            raise RuntimeError("Gemini HTTP client is not installed") from exc
        try:
            async with httpx.AsyncClient(timeout=self.REQUEST_TIMEOUT_SECONDS) as client:
                response = None
                attempts_made = 0
                for attempt in range(self.MAX_ATTEMPTS):
                    attempts_made += 1
                    logger.info(
                        "AI expert request sent: attempt=%d/%d endpoint=%s payload_bytes=%d",
                        attempt + 1,
                        self.MAX_ATTEMPTS,
                        endpoint,
                        len(image_bytes),
                    )
                    logger.info("AI expert request headers: %s", safe_headers)
                    response = await client.post(
                        endpoint,
                        json=payload,
                        headers=request_headers,
                    )
                    logger.info(
                        "AI expert status returned: attempt=%d/%d status=%d content_type=%s",
                        attempt + 1,
                        self.MAX_ATTEMPTS,
                        response.status_code,
                        response.headers.get("content-type"),
                    )
                    if response.status_code >= 400:
                        logger.warning("AI expert error body returned: %s", response.text[:2000])
                    if response.status_code == 503 and attempt < self.MAX_ATTEMPTS - 1:
                        delay = 2 ** attempt
                        logger.warning(
                            "AI expert API returned 503; retrying in %d seconds",
                            delay,
                        )
                        await asyncio.sleep(delay)
                        continue
                    break

                if response is None:
                    raise RuntimeError("AI expert request did not return a response")
                if response.status_code >= 400:
                    raise RuntimeError(
                        f"Gemini API returned HTTP {response.status_code}: "
                        f"{response.text[:1000]}"
                    )
                response_json = response.json()
                logger.info("Gemini response JSON keys: %s", list(response_json))
                candidates = response_json.get("candidates", [])
                if not candidates:
                    raise RuntimeError("AI expert response contained no analysis candidates")
                parts = candidates[0].get("content", {}).get("parts", [])
                text = next((part.get("text") for part in parts if part.get("text")), None)
                if not text:
                    raise RuntimeError("AI expert response contained empty analysis")
                analysis = self._parse_analysis_json(text)
                if not isinstance(analysis, dict):
                    raise RuntimeError("AI expert response was not a JSON object")
                return self._normalize_result(analysis)
        except Exception:
            logger.error(
                "AI expert analysis failed after %d attempt(s); response_status=%s",
                attempts_made if "attempts_made" in locals() else 0,
                response.status_code if response is not None else None,
                exc_info=True,
            )
            raise

    @staticmethod
    def _parse_analysis_json(text: str) -> Dict[str, Any]:
        """Parse JSON returned by Gemini, including a fenced JSON response."""
        candidate = text.strip()
        if candidate.startswith("```"):
            candidate = candidate.split("\n", 1)[1] if "\n" in candidate else candidate
            if candidate.endswith("```"):
                candidate = candidate[:-3].rstrip()
        return json.loads(candidate)

    def _normalize_result(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        result = {key: analysis.get(key, "Not available") for key in self.RESULT_KEYS}
        return result

