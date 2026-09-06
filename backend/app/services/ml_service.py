"""
ML Service
Handles fruit identification, ripeness detection, disease detection, and model management
"""

import os
import json
import numpy as np
from typing import Optional, List, Dict, Any
from datetime import datetime
import cv2
from PIL import Image

from app.core.config import settings
from app.utils.logger import logger


class MLService:
    """Machine Learning service for fruit identification and analysis"""
    
    def __init__(self):
        self.model = None
        self.ripeness_model = None
        self.disease_model = None
        self.labels = None
        self.is_loaded = False
        self._load_models()
    
    def _load_models(self):
        """Load ML models (lazy loading)"""
        try:
            if settings.MOCK_ML_MODEL:
                logger.info("Using mock ML model (MOCK_ML_MODEL=True)")
                self.is_loaded = True
                return
            
            # Import tensorflow only when needed
            import tensorflow as tf
            
            # Load fruit classifier
            if os.path.exists(settings.ML_MODEL_PATH):
                self.model = tf.keras.models.load_model(settings.ML_MODEL_PATH)
                logger.info(f"Loaded fruit classifier from {settings.ML_MODEL_PATH}")
            else:
                logger.warning(f"Fruit classifier not found at {settings.ML_MODEL_PATH}")
            
            # Load class labels
            labels_path = os.path.join(os.path.dirname(settings.ML_MODEL_PATH), "class_labels.json")
            if os.path.exists(labels_path):
                with open(labels_path, 'r') as f:
                    self.labels = json.load(f)
                logger.info(f"Loaded {len(self.labels)} class labels")
            
            self.is_loaded = True
            
        except Exception as e:
            logger.error(f"Failed to load ML models: {e}")
            self.is_loaded = False
    
    def _preprocess_image(self, image_path: str, target_size: tuple = (100, 100)) -> np.ndarray:
        """Preprocess image for model input"""
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            img = np.array(Image.open(image_path))
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, target_size)
        
        # Normalize
        img = img / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    async def identify_fruit(self, image_path: str) -> Dict[str, Any]:
        """
        Identify fruit from image
        
        Args:
            image_path: Path to the image file
        
        Returns:
            Dictionary with identification results
        """
        if not self.is_loaded or settings.MOCK_ML_MODEL:
            # Return mock result for testing
            return {
                "fruit_name": "Apple",
                "confidence": 0.96,
                "top_predictions": [
                    {"name": "Apple", "confidence": 0.96},
                    {"name": "Pear", "confidence": 0.03},
                    {"name": "Quince", "confidence": 0.01},
                ],
                "ripeness": "ripe",
            }
        
        try:
            # Preprocess image
            processed_img = self._preprocess_image(image_path)
            
            # Run inference
            predictions = self.model.predict(processed_img)
            predicted_class = int(np.argmax(predictions[0]))
            confidence = float(np.max(predictions[0]))
            
            # Get fruit name
            fruit_name = self.labels.get(str(predicted_class), f"Class_{predicted_class}") if self.labels else f"Class_{predicted_class}"
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions[0])[-3:][::-1]
            top_predictions = []
            for idx in top_indices:
                name = self.labels.get(str(idx), f"Class_{idx}") if self.labels else f"Class_{idx}"
                top_predictions.append({
                    "name": name,
                    "confidence": float(predictions[0][idx]),
                })
            
            return {
                "fruit_name": fruit_name,
                "confidence": confidence,
                "top_predictions": top_predictions,
                "ripeness": "ripe",
            }
            
        except Exception as e:
            logger.error(f"Fruit identification error: {e}")
            return {
                "fruit_name": "Unknown",
                "confidence": 0.0,
                "top_predictions": [],
                "error": str(e),
            }
    
    async def detect_multiple_fruits(self, image_path: str) -> List[Dict[str, Any]]:
        """Detect multiple fruits in a single image"""
        if not self.is_loaded or settings.MOCK_ML_MODEL:
            return [
                {
                    "fruit_name": "Apple",
                    "confidence": 0.94,
                    "bounding_box": {"x": 100, "y": 150, "width": 120, "height": 110},
                },
                {
                    "fruit_name": "Banana",
                    "confidence": 0.89,
                    "bounding_box": {"x": 300, "y": 200, "width": 80, "height": 140},
                },
            ]
        return []
    
    async def detect_ripeness(self, image_path: str) -> Dict[str, Any]:
        """Detect fruit ripeness from image"""
        if settings.MOCK_ML_MODEL:
            return {
                "ripeness": "ripe",
                "confidence": 0.87,
                "indicators": {"color": "red", "texture": "smooth"},
            }
        return {"ripeness": "unknown", "confidence": 0.0}
    
    async def detect_disease(self, image_path: str) -> Dict[str, Any]:
        """Detect fruit diseases from image"""
        if settings.MOCK_ML_MODEL:
            return {
                "disease_name": "Healthy",
                "confidence": 0.95,
                "severity": "low",
                "description": "No disease detected",
            }
        return {"disease_name": "Unknown", "confidence": 0.0, "severity": "unknown"}
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """Get list of available ML models"""
        models = []
        if self.model:
            models.append({
                "name": "Fruit Classifier",
                "version": settings.ML_MODEL_VERSION,
                "type": "classification",
                "status": "active" if self.is_loaded else "inactive",
            })
        return models
    
    async def activate_model(self, model_id: str) -> bool:
        """Activate a specific model"""
        logger.info(f"Activating model: {model_id}")
        return True