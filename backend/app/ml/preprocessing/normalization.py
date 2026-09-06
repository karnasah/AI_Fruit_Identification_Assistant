"""
Normalization Utilities
Image normalization and standardization functions for ML models
"""

import numpy as np
from typing import Tuple, Optional, Union


class Normalizer:
    """Image normalization utilities"""
    
    # Common mean and std values for pretrained models
    IMAGENET_MEAN = (0.485, 0.456, 0.406)
    IMAGENET_STD = (0.229, 0.224, 0.225)
    
    def __init__(self, method: str = "min_max"):
        """
        Initialize normalizer
        
        Args:
            method: Normalization method ('min_max', 'z_score', 'imagenet')
        """
        self.method = method
    
    def min_max_normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize image to [0, 1] range
        
        Args:
            image: Input image (uint8)
        
        Returns:
            Normalized image (float32)
        """
        return image.astype(np.float32) / 255.0
    
    def min_max_denormalize(self, image: np.ndarray) -> np.ndarray:
        """
        Denormalize image from [0, 1] to [0, 255]
        
        Args:
            image: Input image (float32)
        
        Returns:
            Denormalized image (uint8)
        """
        return (image * 255).astype(np.uint8)
    
    def z_score_normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize using Z-score (mean=0, std=1)
        
        Args:
            image: Input image
        
        Returns:
            Normalized image
        """
        mean = np.mean(image)
        std = np.std(image)
        if std == 0:
            return image - mean
        return (image - mean) / std
    
    def imagenet_normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize using ImageNet mean and std
        
        Args:
            image: Input image (already normalized to [0,1])
        
        Returns:
            Normalized image
        """
        normalized = image.copy()
        for i in range(3):
            normalized[..., i] = (normalized[..., i] - self.IMAGENET_MEAN[i]) / self.IMAGENET_STD[i]
        return normalized
    
    def imagenet_denormalize(self, image: np.ndarray) -> np.ndarray:
        """
        Denormalize from ImageNet normalization
        
        Args:
            image: Input image (ImageNet normalized)
        
        Returns:
            Denormalized image (range [0,1])
        """
        denormalized = image.copy()
        for i in range(3):
            denormalized[..., i] = (denormalized[..., i] * self.IMAGENET_STD[i]) + self.IMAGENET_MEAN[i]
        return np.clip(denormalized, 0, 1)
    
    def normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize image based on selected method
        
        Args:
            image: Input image
        
        Returns:
            Normalized image
        """
        if self.method == "min_max":
            return self.min_max_normalize(image)
        elif self.method == "z_score":
            return self.z_score_normalize(image)
        elif self.method == "imagenet":
            normalized = self.min_max_normalize(image)
            return self.imagenet_normalize(normalized)
        else:
            return image.astype(np.float32)
    
    def denormalize(self, image: np.ndarray) -> np.ndarray:
        """
        Denormalize image
        
        Args:
            image: Normalized image
        
        Returns:
            Denormalized image
        """
        if self.method == "min_max":
            return self.min_max_denormalize(image)
        elif self.method == "imagenet":
            denormalized = self.imagenet_denormalize(image)
            return self.min_max_denormalize(denormalized)
        else:
            return image
    
    def normalize_batch(self, images: np.ndarray) -> np.ndarray:
        """
        Normalize a batch of images
        
        Args:
            images: Batch of images (batch, height, width, channels)
        
        Returns:
            Normalized batch
        """
        normalized = np.zeros_like(images, dtype=np.float32)
        for i in range(images.shape[0]):
            normalized[i] = self.normalize(images[i])
        return normalized
    
    def denormalize_batch(self, images: np.ndarray) -> np.ndarray:
        """
        Denormalize a batch of images
        
        Args:
            images: Batch of normalized images
        
        Returns:
            Denormalized batch
        """
        denormalized = np.zeros_like(images, dtype=np.uint8)
        for i in range(images.shape[0]):
            denormalized[i] = self.denormalize(images[i])
        return denormalized
    
    def set_method(self, method: str) -> None:
        """Change normalization method"""
        self.method = method