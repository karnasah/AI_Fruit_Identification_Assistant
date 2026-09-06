"""
Model Loader
Utilities for loading and managing ML models
"""

import os
import json
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass
from datetime import datetime

from app.core.config import settings
from app.utils.logger import logger


@dataclass
class ModelInfo:
    """Information about a loaded model"""
    name: str
    version: str
    path: str
    loaded_at: datetime
    model_type: str
    num_classes: Optional[int] = None
    input_shape: Optional[tuple] = None
    accuracy: Optional[float] = None


class ModelLoader:
    """Handle loading and management of ML models"""
    
    def __init__(self, models_dir: Optional[str] = None):
        """
        Initialize model loader
        
        Args:
            models_dir: Directory containing model files
        """
        self.models_dir = models_dir or os.path.dirname(settings.ML_MODEL_PATH)
        self.loaded_models: Dict[str, Any] = {}
        self.model_info: Dict[str, ModelInfo] = {}
        
        # Ensure directory exists
        os.makedirs(self.models_dir, exist_ok=True)
    
    def load_tensorflow_model(self, model_name: str, model_path: str) -> Optional[Any]:
        """
        Load a TensorFlow/Keras model
        
        Args:
            model_name: Name to identify the model
            model_path: Path to the model file
        
        Returns:
            Loaded model or None if failed
        """
        try:
            import tensorflow as tf
            
            if not os.path.exists(model_path):
                logger.warning(f"Model file not found: {model_path}")
                return None
            
            model = tf.keras.models.load_model(model_path)
            self.loaded_models[model_name] = model
            self.model_info[model_name] = ModelInfo(
                name=model_name,
                version=self._get_version(model_path),
                path=model_path,
                loaded_at=datetime.now(),
                model_type="tensorflow",
                input_shape=model.input_shape if hasattr(model, 'input_shape') else None,
            )
            
            logger.info(f"Loaded TensorFlow model: {model_name}")
            return model
            
        except ImportError:
            logger.error("TensorFlow not installed")
            return None
        except Exception as e:
            logger.error(f"Failed to load TensorFlow model {model_name}: {e}")
            return None
    
    def load_tflite_model(self, model_name: str, model_path: str) -> Optional[Any]:
        """
        Load a TensorFlow Lite model
        
        Args:
            model_name: Name to identify the model
            model_path: Path to the .tflite file
        
        Returns:
            Loaded interpreter or None if failed
        """
        try:
            import tensorflow as tf
            
            if not os.path.exists(model_path):
                logger.warning(f"TFLite model not found: {model_path}")
                return None
            
            interpreter = tf.lite.Interpreter(model_path=model_path)
            interpreter.allocate_tensors()
            
            self.loaded_models[model_name] = interpreter
            self.model_info[model_name] = ModelInfo(
                name=model_name,
                version=self._get_version(model_path),
                path=model_path,
                loaded_at=datetime.now(),
                model_type="tflite",
            )
            
            logger.info(f"Loaded TFLite model: {model_name}")
            return interpreter
            
        except ImportError:
            logger.error("TensorFlow not installed")
            return None
        except Exception as e:
            logger.error(f"Failed to load TFLite model {model_name}: {e}")
            return None
    
    def load_labels(self, labels_path: str) -> Optional[Dict[str, str]]:
        """
        Load class labels from JSON file
        
        Args:
            labels_path: Path to labels JSON file
        
        Returns:
            Dictionary of class indices to labels
        """
        try:
            if not os.path.exists(labels_path):
                logger.warning(f"Labels file not found: {labels_path}")
                return None
            
            with open(labels_path, 'r') as f:
                labels = json.load(f)
            
            logger.info(f"Loaded {len(labels)} class labels")
            return labels
            
        except Exception as e:
            logger.error(f"Failed to load labels: {e}")
            return None
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get loaded model by name"""
        return self.loaded_models.get(model_name)
    
    def get_model_info(self, model_name: str) -> Optional[ModelInfo]:
        """Get model information by name"""
        return self.model_info.get(model_name)
    
    def unload_model(self, model_name: str) -> bool:
        """Unload a model from memory"""
        if model_name in self.loaded_models:
            del self.loaded_models[model_name]
            del self.model_info[model_name]
            logger.info(f"Unloaded model: {model_name}")
            return True
        return False
    
    def unload_all(self) -> None:
        """Unload all loaded models"""
        self.loaded_models.clear()
        self.model_info.clear()
        logger.info("Unloaded all models")
    
    def list_models(self) -> Dict[str, ModelInfo]:
        """List all loaded models with their info"""
        return self.model_info.copy()
    
    def is_loaded(self, model_name: str) -> bool:
        """Check if a model is loaded"""
        return model_name in self.loaded_models
    
    def _get_version(self, model_path: str) -> str:
        """Extract version from model path or return default"""
        # Try to get version from filename
        basename = os.path.basename(model_path)
        parts = basename.split('_')
        for part in parts:
            if part.startswith('v') and part[1:].isdigit():
                return part[1:]
        return "1.0"
    
    def reload_model(self, model_name: str) -> bool:
        """Reload a model"""
        if model_name not in self.model_info:
            return False
        
        info = self.model_info[model_name]
        
        if info.model_type == "tensorflow":
            return self.load_tensorflow_model(model_name, info.path) is not None
        elif info.model_type == "tflite":
            return self.load_tflite_model(model_name, info.path) is not None
        
        return False