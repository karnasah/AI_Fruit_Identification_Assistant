"""
Metrics Utilities
Functions for calculating model performance metrics
"""

import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)


def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculate accuracy score
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
    
    Returns:
        Accuracy score (0-1)
    """
    return float(accuracy_score(y_true, y_pred))


def calculate_precision_recall(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    average: str = 'weighted',
) -> Tuple[float, float]:
    """
    Calculate precision and recall
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        average: Averaging method ('micro', 'macro', 'weighted')
    
    Returns:
        Tuple of (precision, recall)
    """
    precision = float(precision_score(y_true, y_pred, average=average, zero_division=0))
    recall = float(recall_score(y_true, y_pred, average=average, zero_division=0))
    return precision, recall


def calculate_f1_score(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    average: str = 'weighted',
) -> float:
    """
    Calculate F1 score
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        average: Averaging method ('micro', 'macro', 'weighted')
    
    Returns:
        F1 score
    """
    return float(f1_score(y_true, y_pred, average=average, zero_division=0))


def calculate_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Calculate confusion matrix
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        labels: List of class labels
    
    Returns:
        Dictionary with confusion matrix and visualization data
    """
    cm = confusion_matrix(y_true, y_pred)
    
    result = {
        "matrix": cm.tolist(),
        "shape": cm.shape,
    }
    
    if labels:
        result["labels"] = labels
    
    # Calculate per-class metrics
    per_class = []
    for i in range(len(cm)):
        tp = cm[i, i]
        fp = sum(cm[:, i]) - tp
        fn = sum(cm[i, :]) - tp
        tn = sum(sum(cm)) - tp - fp - fn
        
        per_class.append({
            "class": labels[i] if labels else str(i),
            "true_positives": int(tp),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_negatives": int(tn),
            "precision": float(tp / (tp + fp)) if (tp + fp) > 0 else 0,
            "recall": float(tp / (tp + fn)) if (tp + fn) > 0 else 0,
        })
    
    result["per_class"] = per_class
    
    return result


def calculate_classification_report(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Generate classification report
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        labels: List of class labels
    
    Returns:
        Dictionary with classification metrics
    """
    report = classification_report(
        y_true,
        y_pred,
        target_names=labels,
        output_dict=True,
        zero_division=0,
    )
    
    return report


def calculate_roc_auc(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    multi_class: str = 'ovr',
) -> float:
    """
    Calculate ROC AUC score for multi-class classification
    
    Args:
        y_true: True labels
        y_pred_proba: Predicted probabilities
        multi_class: Multi-class method ('ovr', 'ovo')
    
    Returns:
        ROC AUC score
    """
    try:
        return float(roc_auc_score(y_true, y_pred_proba, multi_class=multi_class))
    except Exception as e:
        print(f"Error calculating ROC AUC: {e}")
        return 0.0


def calculate_regression_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Dict[str, float]:
    """
    Calculate regression metrics
    
    Args:
        y_true: True values
        y_pred: Predicted values
    
    Returns:
        Dictionary with regression metrics
    """
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    return {
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
        "r2": float(r2),
    }


def calculate_top_k_accuracy(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    k: int = 3,
) -> float:
    """
    Calculate top-k accuracy
    
    Args:
        y_true: True labels
        y_pred_proba: Predicted probabilities
        k: Number of top predictions to consider
    
    Returns:
        Top-k accuracy
    """
    top_k_preds = np.argsort(y_pred_proba, axis=1)[:, -k:]
    matches = 0
    for i, true in enumerate(y_true):
        if true in top_k_preds[i]:
            matches += 1
    return matches / len(y_true)


def calculate_confidence_metrics(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    thresholds: List[float] = [0.5, 0.6, 0.7, 0.8, 0.9],
) -> Dict[str, Any]:
    """
    Calculate metrics at different confidence thresholds
    
    Args:
        y_true: True labels
        y_pred_proba: Predicted probabilities
        thresholds: Confidence thresholds to evaluate
    
    Returns:
        Dictionary with metrics at each threshold
    """
    results = {}
    
    for threshold in thresholds:
        # Get predictions above threshold
        max_probs = np.max(y_pred_proba, axis=1)
        high_conf_mask = max_probs >= threshold
        
        if np.sum(high_conf_mask) == 0:
            results[threshold] = {
                "samples": 0,
                "accuracy": 0,
                "precision": 0,
                "recall": 0,
            }
            continue
        
        y_pred = np.argmax(y_pred_proba, axis=1)
        
        accuracy = accuracy_score(
            y_true[high_conf_mask],
            y_pred[high_conf_mask],
        )
        
        precision, recall = calculate_precision_recall(
            y_true[high_conf_mask],
            y_pred[high_conf_mask],
        )
        
        results[threshold] = {
            "samples": int(np.sum(high_conf_mask)),
            "accuracy": float(accuracy),
            "precision": precision,
            "recall": recall,
        }
    
    return results