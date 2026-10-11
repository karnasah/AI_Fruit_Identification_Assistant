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

from app.core.config import BACKEND_DIR, settings
from app.utils.fruit_labels import clean_fruit_label
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
            model_path = settings.ML_MODEL_PATH
            if not os.path.isabs(model_path):
                model_path = os.path.join(BACKEND_DIR, model_path)
            model_path = os.path.abspath(model_path)

            if os.path.exists(model_path) and os.path.getsize(model_path) > 0:
                self.model = tf.keras.models.load_model(model_path)
                logger.info("Model loaded: path=%s input_shape=%s", model_path, self.model.input_shape)
            else:
                logger.error("Model unavailable: path=%s exists=%s size=%s", model_path, os.path.exists(model_path), os.path.getsize(model_path) if os.path.exists(model_path) else 0)
            
            # Load class labels
            labels_path = os.path.join(os.path.dirname(model_path), "class_labels.json")
            if os.path.exists(labels_path):
                with open(labels_path, 'r') as f:
                    self.labels = json.load(f)
                logger.info(f"Loaded {len(self.labels)} class labels")
            
            self.is_loaded = self.model is not None and self.labels is not None
            
        except Exception as e:
            logger.error(f"Failed to load ML models: {e}")
            self.is_loaded = False
    
    def _preprocess_image(self, image_path: str, target_size: tuple = (100, 100)) -> np.ndarray:
        """Preprocess image for model input"""
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            img = np.array(Image.open(image_path))
        else:
            # OpenCV loads images as BGR; PIL fallback already returns RGB.
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, target_size)
        
        # Normalize
        img = img.astype(np.float32) / 255.0
        
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
        if settings.MOCK_ML_MODEL:
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

        if not self.is_loaded or self.model is None or self.labels is None:
            raise RuntimeError("Fruit classifier is not loaded; refusing to return a mock prediction")
        
        try:
            # Preprocess image
            processed_img = self._preprocess_image(image_path)
            logger.info("Image processed: path=%s shape=%s", image_path, processed_img.shape)
            
            # Run inference
            predictions = self.model.predict(processed_img)
            prediction_vector = np.asarray(predictions[0])
            expected_classes = int(self.model.output_shape[-1])
            if prediction_vector.ndim != 1 or prediction_vector.shape[0] != expected_classes:
                raise RuntimeError(
                    f"Unexpected prediction shape: {prediction_vector.shape}; expected ({expected_classes},)"
                )
            if len(self.labels) != expected_classes:
                raise RuntimeError(
                    f"Class label count {len(self.labels)} does not match model output size {expected_classes}"
                )

            predicted_class = int(np.argmax(prediction_vector))
            confidence = float(prediction_vector[predicted_class])
            top_indices = np.argsort(prediction_vector)[-10:][::-1]
            logger.info(
                "Prediction diagnostics: image_shape=%s min=%.8f max=%.8f vector_shape=%s top10=%s",
                processed_img.shape,
                float(processed_img.min()),
                float(processed_img.max()),
                prediction_vector.shape,
                [
                    (
                        int(idx),
                        clean_fruit_label(self.labels.get(str(int(idx)), f"Class_{idx}")),
                        float(prediction_vector[idx]),
                    )
                    for idx in top_indices
                ],
            )
            
            # Get fruit name
            fruit_name = clean_fruit_label(
                self.labels.get(str(predicted_class), f"Class_{predicted_class}")
                if self.labels
                else f"Class_{predicted_class}"
            )
            
            # Get top 3 predictions
            top_indices = top_indices[:3]
            top_predictions = []
            for idx in top_indices:
                name = clean_fruit_label(
                    self.labels.get(str(idx), f"Class_{idx}") if self.labels else f"Class_{idx}"
                )
                top_predictions.append({
                    "name": name,
                    "confidence": float(prediction_vector[idx]),
                })
            
            result = {
                "fruit_name": fruit_name,
                "confidence": confidence,
                "top_predictions": top_predictions,
                "ripeness": "ripe",
            }
            logger.info("Prediction generated: fruit=%s confidence=%.4f", fruit_name, confidence)
            return result
            
        except Exception as e:
            logger.error(f"Fruit identification error: {e}")
            raise
    
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