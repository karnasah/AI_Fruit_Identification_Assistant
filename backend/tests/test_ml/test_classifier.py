"""
ML Classifier Tests
"""

import pytest
from app.ml.inference.classifier import FruitClassifier


class TestFruitClassifier:
    """Test fruit classifier"""
    
    def test_classifier_initialization(self):
        """Test classifier initialization"""
        classifier = FruitClassifier()
        assert classifier is not None
    
    def test_mock_prediction(self):
        """Test mock prediction"""
        classifier = FruitClassifier()
        result = classifier._mock_predict("test.jpg")
        assert "fruit_name" in result
        assert "confidence" in result
        assert result["fruit_name"] == "Apple"