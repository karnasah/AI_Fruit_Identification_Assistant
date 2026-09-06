"""
Disease Detector
Fruit disease detection model inference
"""

import os
import numpy as np
from typing import Dict, Any, Optional, List

from app.ml.preprocessing.image_processor import ImageProcessor
from app.core.config import settings
from app.utils.logger import logger


class DiseaseDetector:
    """Fruit disease detection model"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize disease detector
        
        Args:
            model_path: Path to trained disease model
        """
        self.model_path = model_path or os.path.join(
            os.path.dirname(settings.ML_MODEL_PATH), "disease_model.h5"
        )
        self.model = None
        self.processor = ImageProcessor(target_size=(224, 224))
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load the disease detection model"""
        try:
            if settings.MOCK_ML_MODEL:
                logger.info("Using mock disease detector (MOCK_ML_MODEL=True)")
                self.is_loaded = True
                return
            
            import tensorflow as tf
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info(f"Loaded disease detector from {self.model_path}")
                self.is_loaded = True
            else:
                logger.warning(f"Disease model not found at {self.model_path}")
                
        except ImportError:
            logger.warning("TensorFlow not installed")
        except Exception as e:
            logger.error(f"Failed to load disease detector: {e}")
    
    async def detect(self, image_path: str, confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """
        Detect fruit diseases from image
        
        Args:
            image_path: Path to image file
            confidence_threshold: Minimum confidence for detection
        
        Returns:
            Dictionary with disease detection results
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
            
            # Get disease classes (example)
            disease_classes = [
                "healthy",
                "apple_scab",
                "black_rot",
                "cedar_apple_rust",
                "powdery_mildew",
                "leaf_spot",
                "bacterial_canker",
            ]
            
            predicted_class = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            if confidence < confidence_threshold:
                return {
                    "disease_name": "unknown",
                    "confidence": confidence,
                    "severity": "unknown",
                    "description": "Low confidence detection",
                    "success": False,
                }
            
            disease_name = disease_classes[predicted_class] if predicted_class < len(disease_classes) else "unknown"
            
            # Get disease info
            disease_info = self._get_disease_info(disease_name)
            
            return {
                "disease_name": disease_name,
                "confidence": confidence,
                "severity": disease_info["severity"],
                "description": disease_info["description"],
                "treatment": disease_info.get("treatment"),
                "prevention": disease_info.get("prevention"),
                "success": True,
            }
            
        except Exception as e:
            logger.error(f"Disease detection error: {e}")
            return self._error_result(str(e))
    
    def _get_disease_info(self, disease_name: str) -> Dict[str, str]:
        """Get information about a specific disease"""
        disease_info = {
            "healthy": {
                "severity": "none",
                "description": "The fruit appears healthy with no visible disease symptoms.",
            },
            "apple_scab": {
                "severity": "medium",
                "description": "Olive-green to brown spots on leaves and fruit. Can cause fruit deformities.",
                "treatment": "Apply fungicides early in the season. Remove infected leaves.",
                "prevention": "Plant resistant varieties. Ensure good air circulation.",
            },
            "black_rot": {
                "severity": "high",
                "description": "Purple spots on leaves that enlarge and turn brown. Fruit becomes mummified.",
                "treatment": "Prune infected branches. Apply appropriate fungicides.",
                "prevention": "Remove infected plant debris. Maintain tree health.",
            },
            "cedar_apple_rust": {
                "severity": "medium",
                "description": "Bright yellow-orange spots on leaves and fruit.",
                "treatment": "Remove cedar trees nearby. Apply fungicides.",
                "prevention": "Plant resistant varieties. Avoid planting near cedars.",
            },
            "powdery_mildew": {
                "severity": "low",
                "description": "White powdery coating on leaves and fruit surfaces.",
                "treatment": "Apply sulfur or potassium bicarbonate sprays.",
                "prevention": "Ensure good air circulation. Avoid overhead watering.",
            },
        }
        return disease_info.get(disease_name, {
            "severity": "unknown",
            "description": "Unable to determine specific disease. Consult a plant pathologist.",
        })
    
    def _mock_detect(self, image_path: str) -> Dict[str, Any]:
        """Mock disease detection for testing"""
        return {
            "disease_name": "healthy",
            "confidence": 0.95,
            "severity": "none",
            "description": "The fruit appears healthy with no visible disease symptoms.",
            "treatment": None,
            "prevention": "Continue regular inspection and maintenance.",
            "success": True,
        }
    
    def _error_result(self, error: str) -> Dict[str, Any]:
        """Return error result"""
        return {
            "disease_name": "unknown",
            "confidence": 0.0,
            "severity": "unknown",
            "description": f"Detection failed: {error}",
            "success": False,
            "error": error,
        }
    
    def is_ready(self) -> bool:
        """Check if detector is ready"""
        return self.is_loaded or settings.MOCK_ML_MODEL