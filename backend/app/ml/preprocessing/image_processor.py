"""
Image Processor
Handles image loading, resizing, and preprocessing for ML models
"""

import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional, Union
import os

from app.utils.logger import logger


class ImageProcessor:
    """Image preprocessing utilities for ML models"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize image processor
        
        Args:
            target_size: Target image size (width, height)
        """
        self.target_size = target_size
    
    def load_image(self, image_path: str) -> Optional[np.ndarray]:
        """
        Load image from file path
        
        Args:
            image_path: Path to image file
        
        Returns:
            Image as numpy array or None if failed
        """
        try:
            # Try OpenCV first
            img = cv2.imread(image_path)
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                return img
            
            # Fallback to PIL
            img = Image.open(image_path)
            return np.array(img)
            
        except Exception as e:
            logger.error(f"Failed to load image {image_path}: {e}")
            return None
    
    def load_image_from_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """
        Load image from bytes
        
        Args:
            image_bytes: Image data as bytes
        
        Returns:
            Image as numpy array or None if failed
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                return img
            return None
        except Exception as e:
            logger.error(f"Failed to load image from bytes: {e}")
            return None
    
    def resize(self, image: np.ndarray, target_size: Optional[Tuple[int, int]] = None) -> np.ndarray:
        """
        Resize image to target size
        
        Args:
            image: Input image
            target_size: Target size (default: self.target_size)
        
        Returns:
            Resized image
        """
        size = target_size or self.target_size
        return cv2.resize(image, size, interpolation=cv2.INTER_LINEAR)
    
    def normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize image to [0, 1] range
        
        Args:
            image: Input image
        
        Returns:
            Normalized image
        """
        return image.astype(np.float32) / 255.0
    
    def standardize(self, image: np.ndarray, mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
                   std: Tuple[float, float, float] = (0.229, 0.224, 0.225)) -> np.ndarray:
        """
        Standardize image using mean and std (for pretrained models)
        
        Args:
            image: Input image
            mean: Mean values for each channel
            std: Standard deviation for each channel
        
        Returns:
            Standardized image
        """
        normalized = self.normalize(image)
        for i in range(3):
            normalized[..., i] = (normalized[..., i] - mean[i]) / std[i]
        return normalized
    
    def preprocess_for_model(self, image: Union[str, bytes, np.ndarray]) -> Optional[np.ndarray]:
        """
        Complete preprocessing pipeline for model input
        
        Args:
            image: Image path, bytes, or numpy array
        
        Returns:
            Preprocessed image ready for model (batch dimension added)
        """
        # Load image
        if isinstance(image, str):
            img = self.load_image(image)
        elif isinstance(image, bytes):
            img = self.load_image_from_bytes(image)
        else:
            img = image
        
        if img is None:
            return None
        
        # Resize
        img = self.resize(img)
        
        # Normalize
        img = self.normalize(img)
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def preprocess_for_training(self, image: np.ndarray, augment: bool = False) -> np.ndarray:
        """
        Preprocess image for training
        
        Args:
            image: Input image
            augment: Whether to apply augmentation
        
        Returns:
            Preprocessed image
        """
        img = self.resize(image)
        img = self.normalize(img)
        return img
    
    def get_image_dimensions(self, image_path: str) -> Optional[Tuple[int, int]]:
        """
        Get image dimensions
        
        Args:
            image_path: Path to image file
        
        Returns:
            Tuple of (height, width) or None
        """
        try:
            img = Image.open(image_path)
            return img.size[1], img.size[0]  # height, width
        except Exception as e:
            logger.error(f"Failed to get image dimensions: {e}")
            return None
    
    def convert_to_tensorflow_format(self, image: np.ndarray) -> np.ndarray:
        """
        Convert image to TensorFlow format (NHWC)
        
        Args:
            image: Input image
        
        Returns:
            Image in NHWC format
        """
        if len(image.shape) == 3:
            return np.expand_dims(image, axis=0)
        return image