"""
Transfer Learning Setup
Utilities for setting up transfer learning with pre-trained models
"""

import os
import numpy as np
from typing import Tuple, Dict, Any, Optional, List
from tensorflow.keras.applications import (
    MobileNetV2,
    ResNet50,
    EfficientNetB0,
    VGG16,
    InceptionV3,
    DenseNet121,
)
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.layers import (
    Dense,
    GlobalAveragePooling2D,
    GlobalMaxPooling2D,
    Dropout,
    BatchNormalization,
    Input,
)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.regularizers import l2

from app.utils.logger import logger


# Available pre-trained models
AVAILABLE_MODELS = {
    "mobilenetv2": {
        "builder": MobileNetV2,
        "input_size": (224, 224),
        "weights": "imagenet",
        "description": "MobileNetV2 - Lightweight and fast",
    },
    "resnet50": {
        "builder": ResNet50,
        "input_size": (224, 224),
        "weights": "imagenet",
        "description": "ResNet50 - Good accuracy, medium size",
    },
    "efficientnetb0": {
        "builder": EfficientNetB0,
        "input_size": (224, 224),
        "weights": "imagenet",
        "description": "EfficientNetB0 - State-of-the-art accuracy",
    },
    "vgg16": {
        "builder": VGG16,
        "input_size": (224, 224),
        "weights": "imagenet",
        "description": "VGG16 - High accuracy, larger model",
    },
    "inceptionv3": {
        "builder": InceptionV3,
        "input_size": (299, 299),
        "weights": "imagenet",
        "description": "InceptionV3 - Good for complex features",
    },
    "densenet121": {
        "builder": DenseNet121,
        "input_size": (224, 224),
        "weights": "imagenet",
        "description": "DenseNet121 - Efficient parameter usage",
    },
}


def create_transfer_learning_model(
    base_model_name: str = "mobilenetv2",
    num_classes: int = 10,
    include_top: bool = False,
    freeze_base: bool = True,
    dropout_rate: float = 0.5,
    l2_reg: float = 0.01,
    pooling: str = "avg",
) -> Tuple[Model, Dict[str, Any]]:
    """
    Create a transfer learning model with pre-trained base
    
    Args:
        base_model_name: Name of the base model to use
        num_classes: Number of output classes
        include_top: Whether to include base model's top layers
        freeze_base: Whether to freeze base model layers
        dropout_rate: Dropout rate for regularization
        l2_reg: L2 regularization factor
        pooling: Pooling type ('avg' or 'max')
    
    Returns:
        Tuple of (model, model_info)
    """
    
    if base_model_name not in AVAILABLE_MODELS:
        raise ValueError(f"Unknown model: {base_model_name}. Available: {list(AVAILABLE_MODELS.keys())}")
    
    model_info = AVAILABLE_MODELS[base_model_name].copy()
    input_size = model_info["input_size"]
    
    logger.info(f"Creating transfer learning model with base: {base_model_name}")
    logger.info(f"Input size: {input_size}, Classes: {num_classes}")
    
    # Load base model
    base_model = model_info["builder"](
        weights=model_info["weights"],
        include_top=include_top,
        input_shape=(input_size[0], input_size[1], 3),
        pooling=pooling,
    )
    
    # Freeze base model if requested
    base_model.trainable = not freeze_base
    
    if freeze_base:
        logger.info("Base model layers frozen")
    else:
        logger.info("Base model layers trainable")
    
    # Build custom head
    inputs = Input(shape=(input_size[0], input_size[1], 3))
    x = base_model(inputs)
    
    # Add custom layers
    x = Dense(512, activation='relu', kernel_regularizer=l2(l2_reg))(x)
    x = BatchNormalization()(x)
    x = Dropout(dropout_rate)(x)
    
    x = Dense(256, activation='relu', kernel_regularizer=l2(l2_reg))(x)
    x = BatchNormalization()(x)
    x = Dropout(dropout_rate * 0.7)(x)
    
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    
    model_info.update({
        "num_classes": num_classes,
        "total_params": model.count_params(),
        "trainable_params": sum([w.shape.num_elements() for w in model.trainable_weights]),
        "non_trainable_params": sum([w.shape.num_elements() for w in model.non_trainable_weights]),
    })
    
    logger.info(f"Total parameters: {model_info['total_params']:,}")
    logger.info(f"Trainable parameters: {model_info['trainable_params']:,}")
    
    return model, model_info


def unfreeze_layers(
    model: Model,
    num_layers_to_unfreeze: int = 10,
    from_end: bool = True,
) -> Model:
    """
    Unfreeze top layers of the base model for fine-tuning
    
    Args:
        model: The model containing base model
        num_layers_to_unfreeze: Number of layers to unfreeze
        from_end: Whether to unfreeze from the end of the base model
    
    Returns:
        Model with unfrozen layers
    """
    
    # Find base model in the model
    base_model = None
    for layer in model.layers:
        if isinstance(layer, (MobileNetV2, ResNet50, EfficientNetB0, VGG16, InceptionV3, DenseNet121)):
            base_model = layer
            break
    
    if base_model is None:
        logger.warning("Could not find base model to unfreeze layers")
        return model
    
    # Get layers of base model
    base_layers = base_model.layers
    
    if from_end:
        # Unfreeze last N layers
        for layer in base_layers[-num_layers_to_unfreeze:]:
            layer.trainable = True
    else:
        # Unfreeze first N layers
        for layer in base_layers[:num_layers_to_unfreeze]:
            layer.trainable = True
    
    # Update base model trainable flag
    base_model.trainable = True
    
    logger.info(f"Unfroze {num_layers_to_unfreeze} layers of base model")
    
    return model


def create_ensemble_model(
    models: List[str],
    num_classes: int,
    input_size: Tuple[int, int] = (224, 224),
) -> Model:
    """
    Create an ensemble of multiple models
    
    Args:
        models: List of model names to ensemble
        num_classes: Number of output classes
        input_size: Input image size
    
    Returns:
        Ensemble model
    """
    from tensorflow.keras.layers import Average, Concatenate
    from tensorflow.keras import Model as KerasModel
    
    logger.info(f"Creating ensemble of models: {models}")
    
    inputs = Input(shape=(input_size[0], input_size[1], 3))
    model_outputs = []
    
    for model_name in models:
        if model_name in AVAILABLE_MODELS:
            base_model = AVAILABLE_MODELS[model_name]["builder"](
                weights=AVAILABLE_MODELS[model_name]["weights"],
                include_top=False,
                input_tensor=inputs,
                pooling='avg',
            )
            base_model.trainable = False
            
            x = Dense(512, activation='relu')(base_model.output)
            x = Dropout(0.5)(x)
            x = Dense(256, activation='relu')(x)
            output = Dense(num_classes, activation='softmax')(x)
            model_outputs.append(output)
    
    if len(model_outputs) == 1:
        outputs = model_outputs[0]
    else:
        outputs = Average()(model_outputs)
    
    ensemble_model = KerasModel(inputs=inputs, outputs=outputs)
    
    ensemble_model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    logger.info(f"Ensemble model created with {len(model_outputs)} models")
    
    return ensemble_model


def get_model_recommendation(
    dataset_size: int,
    num_classes: int,
    speed_requirement: str = "balanced",
) -> str:
    """
    Get recommended model based on dataset characteristics
    
    Args:
        dataset_size: Number of training samples
        num_classes: Number of classes
        speed_requirement: 'fast', 'balanced', 'accurate'
    
    Returns:
        Recommended model name
    """
    
    if speed_requirement == "fast":
        return "mobilenetv2"
    
    if dataset_size < 1000:
        return "mobilenetv2"
    elif dataset_size < 10000:
        if speed_requirement == "accurate":
            return "efficientnetb0"
        return "resnet50"
    else:
        if speed_requirement == "accurate":
            return "densenet121"
        return "efficientnetb0"


if __name__ == "__main__":
    # Example: Create a transfer learning model
    model, info = create_transfer_learning_model(
        base_model_name="mobilenetv2",
        num_classes=131,
        dropout_rate=0.5,
    )
    
    print(f"Model info: {info}")
    print(f"Model summary: {model.summary()}")