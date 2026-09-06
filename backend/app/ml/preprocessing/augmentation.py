"""
Image Augmentation
Data augmentation techniques for training ML models
"""

import numpy as np
import cv2
import random
from typing import Tuple, Optional, List, Dict, Any

from app.utils.logger import logger


class ImageAugmenter:
    """Data augmentation utilities for training"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize image augmenter
        
        Args:
            config: Augmentation configuration
        """
        self.config = config or {
            "rotation_range": 20,
            "width_shift_range": 0.2,
            "height_shift_range": 0.2,
            "shear_range": 0.2,
            "zoom_range": 0.2,
            "horizontal_flip": True,
            "vertical_flip": False,
            "brightness_range": (0.8, 1.2),
        }
    
    def random_rotate(self, image: np.ndarray) -> np.ndarray:
        """Randomly rotate image"""
        angle = random.uniform(-self.config["rotation_range"], self.config["rotation_range"])
        height, width = image.shape[:2]
        center = (width // 2, height // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(image, rotation_matrix, (width, height))
    
    def random_shift(self, image: np.ndarray) -> np.ndarray:
        """Randomly shift image horizontally and vertically"""
        height, width = image.shape[:2]
        
        # Horizontal shift
        h_shift = random.uniform(-self.config["width_shift_range"], self.config["width_shift_range"])
        h_shift_pixels = int(h_shift * width)
        
        # Vertical shift
        v_shift = random.uniform(-self.config["height_shift_range"], self.config["height_shift_range"])
        v_shift_pixels = int(v_shift * height)
        
        # Apply shift
        translation_matrix = np.float32([[1, 0, h_shift_pixels], [0, 1, v_shift_pixels]])
        return cv2.warpAffine(image, translation_matrix, (width, height))
    
    def random_zoom(self, image: np.ndarray) -> np.ndarray:
        """Randomly zoom image"""
        zoom = random.uniform(1 - self.config["zoom_range"], 1 + self.config["zoom_range"])
        height, width = image.shape[:2]
        new_height = int(height * zoom)
        new_width = int(width * zoom)
        
        # Resize
        resized = cv2.resize(image, (new_width, new_height))
        
        # Crop to original size
        if zoom > 1:
            start_y = (new_height - height) // 2
            start_x = (new_width - width) // 2
            return resized[start_y:start_y + height, start_x:start_x + width]
        else:
            # Pad to original size
            pad_y = (height - new_height) // 2
            pad_x = (width - new_width) // 2
            padded = np.zeros_like(image)
            padded[pad_y:pad_y + new_height, pad_x:pad_x + new_width] = resized
            return padded
    
    def random_flip(self, image: np.ndarray) -> np.ndarray:
        """Randomly flip image horizontally or vertically"""
        if self.config["horizontal_flip"] and random.random() > 0.5:
            image = cv2.flip(image, 1)  # Horizontal flip
        
        if self.config["vertical_flip"] and random.random() > 0.5:
            image = cv2.flip(image, 0)  # Vertical flip
        
        return image
    
    def random_brightness(self, image: np.ndarray) -> np.ndarray:
        """Randomly adjust brightness"""
        brightness = random.uniform(self.config["brightness_range"][0], self.config["brightness_range"][1])
        return np.clip(image * brightness, 0, 255).astype(np.uint8)
    
    def random_shear(self, image: np.ndarray) -> np.ndarray:
        """Randomly shear image"""
        shear = random.uniform(-self.config["shear_range"], self.config["shear_range"])
        height, width = image.shape[:2]
        shear_matrix = np.float32([[1, shear, 0], [0, 1, 0]])
        return cv2.warpAffine(image, shear_matrix, (width, height))
    
    def augment(self, image: np.ndarray) -> np.ndarray:
        """
        Apply random augmentations to image
        
        Args:
            image: Input image
        
        Returns:
            Augmented image
        """
        augmented = image.copy()
        
        # Apply augmentations in random order
        augmentations = []
        
        if self.config.get("rotation_range", 0) > 0:
            augmentations.append(self.random_rotate)
        if self.config.get("width_shift_range", 0) > 0 or self.config.get("height_shift_range", 0) > 0:
            augmentations.append(self.random_shift)
        if self.config.get("zoom_range", 0) > 0:
            augmentations.append(self.random_zoom)
        if self.config.get("horizontal_flip", False) or self.config.get("vertical_flip", False):
            augmentations.append(self.random_flip)
        if self.config.get("brightness_range", None):
            augmentations.append(self.random_brightness)
        if self.config.get("shear_range", 0) > 0:
            augmentations.append(self.random_shear)
        
        random.shuffle(augmentations)
        
        for aug in augmentations:
            try:
                augmented = aug(augmented)
            except Exception as e:
                logger.warning(f"Augmentation failed: {e}")
                continue
        
        return augmented
    
    def augment_batch(self, images: List[np.ndarray]) -> List[np.ndarray]:
        """
        Apply augmentations to a batch of images
        
        Args:
            images: List of images
        
        Returns:
            List of augmented images
        """
        return [self.augment(img) for img in images]
    
    def get_config(self) -> Dict[str, Any]:
        """Get augmentation configuration"""
        return self.config.copy()