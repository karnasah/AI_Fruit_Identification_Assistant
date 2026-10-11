"""
Fruit Classifier
Main fruit classification model inference
"""

import os
import json
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

from app.ml.preprocessing.image_processor import ImageProcessor
from app.core.config import settings
from app.utils.fruit_labels import clean_fruit_label
from app.utils.logger import logger


class FruitClassifier:
    """Fruit classification model"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize fruit classifier
        
        Args:
            model_path: Path to trained model file
        """
        self.model_path = model_path or settings.ML_MODEL_PATH
        self.model = None
        self.labels = None
        self.processor = ImageProcessor(target_size=(224, 224))
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load the trained model and labels"""
        try:
            if settings.MOCK_ML_MODEL:
                logger.info("Using mock fruit classifier (MOCK_ML_MODEL=True)")
                self.is_loaded = True
                return
            
            # Load labels
            labels_path = os.path.join(os.path.dirname(self.model_path), "class_labels.json")
            if os.path.exists(labels_path):
                with open(labels_path, 'r') as f:
                    self.labels = json.load(f)
                logger.info(f"Loaded {len(self.labels)} class labels")
            
            # Load TensorFlow model
            import tensorflow as tf
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info(f"Loaded fruit classifier from {self.model_path}")
                self.is_loaded = True
            else:
                logger.warning(f"Model not found at {self.model_path}")
                
        except ImportError:
            logger.warning("TensorFlow not installed. Install with: pip install tensorflow")
        except Exception as e:
            logger.error(f"Failed to load fruit classifier: {e}")
    
    async def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Predict fruit from image
        
        Args:
            image_path: Path to image file
        
        Returns:
            Dictionary with prediction results
        """
        if not self.is_loaded or settings.MOCK_ML_MODEL:
            return self._mock_predict(image_path)
        
        try:
            # Preprocess image
            processed_image = self.processor.preprocess_for_model(image_path)
            if processed_image is None:
                return self._error_result("Failed to process image")
            
            # Run inference
            predictions = self.model.predict(processed_image)
            predicted_class = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            # Get fruit name
            fruit_name = self._get_fruit_name(predicted_class)
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions[0])[-3:][::-1]
            top_predictions = []
            for idx in top_indices:
                name = self._get_fruit_name(idx)
                top_predictions.append({
                    "name": name,
                    "confidence": float(predictions[0][idx]),
                })
            
            return {
                "fruit_name": fruit_name,
                "confidence": confidence,
                "top_predictions": top_predictions,
                "success": True,
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._error_result(str(e))
    
    async def predict_batch(self, image_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Predict fruits for multiple images
        
        Args:
            image_paths: List of image paths
        
        Returns:
            List of prediction results
        """
        results = []
        for path in image_paths:
            result = await self.predict(path)
            results.append(result)
        return results
    
    def _get_fruit_name(self, class_idx: int) -> str:
        """Get fruit name from class index"""
        if self.labels and str(class_idx) in self.labels:
            return clean_fruit_label(self.labels[str(class_idx)])
        return f"Class_{class_idx}"
    
    def _mock_predict(self, image_path: str) -> Dict[str, Any]:
        """Mock prediction for testing"""
        return {
            "fruit_name": "Apple",
            "confidence": 0.96,
            "top_predictions": [
                {"name": "Apple", "confidence": 0.96},
                {"name": "Pear", "confidence": 0.03},
                {"name": "Quince", "confidence": 0.01},
            ],
            "success": True,
        }
    
    def _error_result(self, error: str) -> Dict[str, Any]:
        """Return error result"""
        return {
            "fruit_name": "Unknown",
            "confidence": 0.0,
            "top_predictions": [],
            "success": False,
            "error": error,
        }
    
    def is_ready(self) -> bool:
        """Check if model is ready for inference"""
        return self.is_loaded or settings.MOCK_ML_MODEL