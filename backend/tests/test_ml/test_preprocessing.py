"""
ML Preprocessing Tests
"""

import numpy as np
from app.ml.preprocessing.image_processor import ImageProcessor
from app.ml.preprocessing.normalization import Normalizer


class TestImageProcessor:
    """Test image processor"""
    
    def test_processor_initialization(self):
        """Test processor initialization"""
        processor = ImageProcessor()
        assert processor.target_size == (224, 224)
    
    def test_normalize(self):
        """Test image normalization"""
        processor = ImageProcessor()
        image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        normalized = processor.normalize(image)
        assert normalized.max() <= 1.0
        assert normalized.min() >= 0.0


class TestNormalizer:
    """Test normalizer"""
    
    def test_min_max_normalize(self):
        """Test min-max normalization"""
        normalizer = Normalizer(method="min_max")
        image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        normalized = normalizer.normalize(image)
        assert normalized.max() <= 1.0
        assert normalized.min() >= 0.0