"""
Evaluate Model
Evaluates trained ML models and generates performance reports
"""

import os
import sys
import json
import numpy as np
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import asyncio

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.ml.inference.classifier import FruitClassifier
from app.ml.inference.ripeness import RipenessDetector
from app.ml.inference.disease import DiseaseDetector
from app.ml.utils.metrics import (
    calculate_accuracy,
    calculate_precision_recall,
    calculate_f1_score,
    calculate_confusion_matrix,
    calculate_classification_report,
)
from app.utils.logger import logger


class ModelEvaluator:
    """Evaluate ML model performance"""
    
    def __init__(self, model_type: str = "classifier"):
        """
        Initialize model evaluator
        
        Args:
            model_type: Type of model ('classifier', 'ripeness', 'disease')
        """
        self.model_type = model_type
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the appropriate model"""
        if self.model_type == "classifier":
            self.model = FruitClassifier()
        elif self.model_type == "ripeness":
            self.model = RipenessDetector()
        elif self.model_type == "disease":
            self.model = DiseaseDetector()
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    async def evaluate_on_directory(
        self,
        test_dir: str,
        batch_size: int = 32,
    ) -> Dict[str, Any]:
        """
        Evaluate model on test directory
        
        Args:
            test_dir: Directory with test images (subfolders per class)
            batch_size: Batch size for evaluation
        
        Returns:
            Dictionary with evaluation metrics
        """
        logger.info(f"Evaluating {self.model_type} model on {test_dir}")
        
        # Collect all images and labels
        images = []
        true_labels = []
        class_names = []
        
        for class_name in os.listdir(test_dir):
            class_path = os.path.join(test_dir, class_name)
            if os.path.isdir(class_path):
                class_names.append(class_name)
                for img_file in os.listdir(class_path):
                    if img_file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        images.append(os.path.join(class_path, img_file))
                        true_labels.append(class_name)
        
        logger.info(f"Found {len(images)} test images across {len(class_names)} classes")
        
        # Run predictions
        predictions = []
        confidences = []
        
        for i, img_path in enumerate(images):
            if self.model_type == "classifier":
                result = await self.model.predict(img_path)
                predictions.append(result.get("fruit_name", "unknown"))
                confidences.append(result.get("confidence", 0))
            elif self.model_type == "ripeness":
                result = await self.model.detect(img_path)
                predictions.append(result.get("ripeness", "unknown"))
                confidences.append(result.get("confidence", 0))
            elif self.model_type == "disease":
                result = await self.model.detect(img_path)
                predictions.append(result.get("disease_name", "unknown"))
                confidences.append(result.get("confidence", 0))
            
            if (i + 1) % 100 == 0:
                logger.info(f"Processed {i + 1}/{len(images)} images")
        
        # Calculate metrics
        metrics = self._calculate_metrics(true_labels, predictions, confidences, class_names)
        
        # Generate report
        report = self._generate_report(metrics, class_names)
        
        return {
            "metrics": metrics,
            "report": report,
            "total_samples": len(images),
            "class_names": class_names,
            "predictions": predictions[:10],  # Sample predictions
            "true_labels": true_labels[:10],
        }
    
    def _calculate_metrics(
        self,
        y_true: list,
        y_pred: list,
        y_confidences: list,
        class_names: list,
    ) -> Dict[str, Any]:
        """Calculate evaluation metrics"""
        
        # Convert labels to indices
        label_to_idx = {name: i for i, name in enumerate(class_names)}
        y_true_idx = [label_to_idx.get(l, 0) for l in y_true]
        y_pred_idx = [label_to_idx.get(p, 0) for p in y_pred]
        
        # Calculate metrics
        accuracy = calculate_accuracy(y_true_idx, y_pred_idx)
        precision, recall = calculate_precision_recall(y_true_idx, y_pred_idx)
        f1 = calculate_f1_score(y_true_idx, y_pred_idx)
        confusion = calculate_confusion_matrix(y_true_idx, y_pred_idx, class_names)
        classification_rep = calculate_classification_report(y_true_idx, y_pred_idx, class_names)
        
        # Average confidence
        avg_confidence = np.mean(y_confidences) if y_confidences else 0
        
        # Per-class accuracy
        per_class_accuracy = {}
        for i, class_name in enumerate(class_names):
            class_mask = [idx == i for idx in y_true_idx]
            if sum(class_mask) > 0:
                class_correct = sum(1 for j, m in enumerate(class_mask) if m and y_pred_idx[j] == i)
                per_class_accuracy[class_name] = class_correct / sum(class_mask)
            else:
                per_class_accuracy[class_name] = 0
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "avg_confidence": avg_confidence,
            "per_class_accuracy": per_class_accuracy,
            "confusion_matrix": confusion,
            "classification_report": classification_rep,
        }
    
    def _generate_report(self, metrics: Dict, class_names: list) -> str:
        """Generate human-readable evaluation report"""
        
        report = []
        report.append("=" * 60)
        report.append(f"MODEL EVALUATION REPORT - {self.model_type.upper()}")
        report.append("=" * 60)
        report.append(f"Evaluation Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        report.append("OVERALL METRICS:")
        report.append(f"  Accuracy:  {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.2f}%)")
        report.append(f"  Precision: {metrics['precision']:.4f}")
        report.append(f"  Recall:    {metrics['recall']:.4f}")
        report.append(f"  F1 Score:  {metrics['f1_score']:.4f}")
        report.append(f"  Avg Confidence: {metrics['avg_confidence']:.4f}")
        report.append("")
        report.append("PER-CLASS ACCURACY:")
        
        for class_name, acc in metrics['per_class_accuracy'].items():
            report.append(f"  {class_name}: {acc:.4f} ({acc*100:.2f}%)")
        
        report.append("")
        report.append("=" * 60)
        
        return "\n".join(report)
    
    def save_report(self, metrics: Dict, output_path: str) -> None:
        """Save evaluation report to file"""
        
        report_data = {
            "model_type": self.model_type,
            "evaluation_time": datetime.now().isoformat(),
            "metrics": {
                "accuracy": metrics['accuracy'],
                "precision": metrics['precision'],
                "recall": metrics['recall'],
                "f1_score": metrics['f1_score'],
                "avg_confidence": metrics['avg_confidence'],
                "per_class_accuracy": metrics['per_class_accuracy'],
            },
        }
        
        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        logger.info(f"Report saved to {output_path}")


async def evaluate_model(
    model_type: str = "classifier",
    test_dir: str = "./datasets/test",
    output_dir: str = "./reports",
) -> Dict[str, Any]:
    """
    Evaluate a model
    
    Args:
        model_type: Type of model ('classifier', 'ripeness', 'disease')
        test_dir: Directory with test images
        output_dir: Directory to save reports
    
    Returns:
        Evaluation results
    """
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize evaluator
    evaluator = ModelEvaluator(model_type)
    
    # Run evaluation
    results = await evaluator.evaluate_on_directory(test_dir)
    
    # Save report
    report_path = os.path.join(output_dir, f"{model_type}_evaluation_report.json")
    evaluator.save_report(results['metrics'], report_path)
    
    # Print summary
    print(results['report'])
    
    return results


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Evaluate ML model")
    parser.add_argument(
        "--model",
        type=str,
        default="classifier",
        choices=["classifier", "ripeness", "disease"],
        help="Model type to evaluate"
    )
    parser.add_argument(
        "--test-dir",
        type=str,
        default="./datasets/test",
        help="Directory with test images"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./reports",
        help="Directory to save reports"
    )
    
    args = parser.parse_args()
    
    asyncio.run(evaluate_model(args.model, args.test_dir, args.output_dir))