"""
Ripeness Detector
Fruit ripeness detection model inference
"""

import os
import numpy as np
from typing import Dict, Any, Optional, Tuple

from app.ml.preprocessing.image_processor import ImageProcessor
from app.core.config import settings
from app.utils.logger import logger


class RipenessDetector:
    """Fruit ripeness detection model"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize ripeness detector
        
        Args:
            model_path: Path to trained ripeness model
        """
        self.model_path = model_path or os.path.join(
            os.path.dirname(settings.ML_MODEL_PATH), "ripeness_model.h5"
        )
        self.model = None
        self.processor = ImageProcessor(target_size=(224, 224))
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load the ripeness detection model"""
        try:
            if settings.MOCK_ML_MODEL:
                logger.info("Using mock ripeness detector (MOCK_ML_MODEL=True)")
                self.is_loaded = True
                return
            
            import tensorflow as tf
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info(f"Loaded ripeness detector from {self.model_path}")
                self.is_loaded = True
            else:
                logger.warning(f"Ripeness model not found at {self.model_path}")
                
        except ImportError:
            logger.warning("TensorFlow not installed")
        except Exception as e:
            logger.error(f"Failed to load ripeness detector: {e}")
    
    async def detect(self, image_path: str) -> Dict[str, Any]:
        """
        Detect fruit ripeness from image
        
        Args:
            image_path: Path to image file
        
        Returns:
            Dictionary with ripeness detection results
        """
        if not self.is_loaded or settings.MOCK_ML_MODEL:
            return self._mock_detect(image_path)
        
        try:
            # Preprocess image
            processed_image = self.processor.preprocess_for_model(image_path)
            if processed_image is None:
                return self._error_result("Failed to process image")
            
            # Run inference
            predictions = self.model.predict(processed_image)
            
            # Assuming 3 classes: 0=unripe, 1=ripe, 2=overripe
            ripeness_classes = ["unripe", "ripe", "overripe"]
            predicted_class = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            ripeness = ripeness_classes[predicted_class] if predicted_class < len(ripeness_classes) else "unknown"
            
            return {
                "ripeness": ripeness,
                "confidence": confidence,
                "indicators": self._get_ripeness_indicators(ripeness),
                "success": True,
            }
            
        except Exception as e:
            logger.error(f"Ripeness detection error: {e}")
            return self._error_result(str(e))
    
    def _get_ripeness_indicators(self, ripeness: str) -> Dict[str, str]:
        """Get ripeness indicators based on detected state"""
        indicators = {
            "unripe": {
                "color": "Green",
                "texture": "Firm",
                "smell": "Mild or no aroma",
                "tip": "Leave at room temperature to ripen",
            },
            "ripe": {
                "color": "Expected color (e.g., red, yellow)",
                "texture": "Slightly soft to touch",
                "smell": "Sweet, fragrant aroma",
                "tip": "Ready to eat! Refrigerate if not consuming immediately",
            },
            "overripe": {
                "color": "Darker than normal",
                "texture": "Very soft, mushy",
                "smell": "Fermented or sour smell",
                "tip": "Use immediately for smoothies or baking",
            },
        }
        return indicators.get(ripeness, indicators["ripe"])
    
    def _mock_detect(self, image_path: str) -> Dict[str, Any]:
        """Mock ripeness detection for testing"""
        return {
            "ripeness": "ripe",
            "confidence": 0.87,
            "indicators": {
                "color": "Red",
                "texture": "Slightly soft",
                "smell": "Sweet aroma",
                "tip": "Ready to eat!",
            },
            "success": True,
        }
    
    def _error_result(self, error: str) -> Dict[str, Any]:
        """Return error result"""
        return {
            "ripeness": "unknown",
            "confidence": 0.0,
            "indicators": {},
            "success": False,
            "error": error,
        }
    
    def is_ready(self) -> bool:
        """Check if detector is ready"""
        return self.is_loaded or settings.MOCK_ML_MODEL