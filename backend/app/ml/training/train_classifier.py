"""
Train Fruit Classifier
Trains the main fruit classification model using TensorFlow/Keras
"""

import os
import json
import numpy as np
from typing import Tuple, Dict, Any, Optional
from datetime import datetime

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2, ResNet50, EfficientNetB0
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from sklearn.model_selection import train_test_split

from app.core.config import settings
from app.utils.logger import logger


def train_classifier(
    data_dir: str,
    model_name: str = "mobilenetv2",
    epochs: int = 50,
    batch_size: int = 32,
    img_size: Tuple[int, int] = (224, 224),
    learning_rate: float = 0.001,
    validation_split: float = 0.2,
    output_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Train fruit classifier model
    
    Args:
        data_dir: Directory containing training data (subfolders per class)
        model_name: Base model name ('mobilenetv2', 'resnet50', 'efficientnet')
        epochs: Number of training epochs
        batch_size: Batch size for training
        img_size: Target image size
        learning_rate: Learning rate for optimizer
        validation_split: Fraction of data for validation
        output_dir: Directory to save model
    
    Returns:
        Dictionary with training results
    """
    logger.info(f"Starting fruit classifier training with {model_name}")
    
    # Set output directory
    if output_dir is None:
        output_dir = os.path.dirname(settings.ML_MODEL_PATH)
    os.makedirs(output_dir, exist_ok=True)
    
    # Load and prepare data
    train_generator, validation_generator, num_classes, class_indices = _prepare_data(
        data_dir, img_size, batch_size, validation_split
    )
    
    # Build model
    model = _build_model(model_name, num_classes, img_size, learning_rate)
    
    # Setup callbacks
    callbacks = _setup_callbacks(output_dir)
    
    # Train model
    logger.info(f"Training for {epochs} epochs...")
    history = model.fit(
        train_generator,
        validation_data=validation_generator,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1,
    )
    
    # Save class indices
    class_labels_path = os.path.join(output_dir, "class_labels.json")
    with open(class_labels_path, 'w') as f:
        json.dump(class_indices, f, indent=2)
    logger.info(f"Saved class labels to {class_labels_path}")
    
    # Evaluate model
    evaluation = model.evaluate(validation_generator, verbose=0)
    metrics = dict(zip(model.metrics_names, evaluation))
    
    logger.info(f"Training completed. Validation accuracy: {metrics.get('accuracy', 0):.4f}")
    
    return {
        "model_path": os.path.join(output_dir, "fruit_classifier.h5"),
        "class_labels_path": class_labels_path,
        "num_classes": num_classes,
        "class_indices": class_indices,
        "history": history.history,
        "metrics": metrics,
        "epochs_completed": len(history.history.get('loss', [])),
    }


def _prepare_data(
    data_dir: str,
    img_size: Tuple[int, int],
    batch_size: int,
    validation_split: float,
):
    """Prepare data generators for training"""
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=validation_split,
    )
    
    # No augmentation for validation
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=validation_split,
    )
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True,
    )
    
    # Validation generator
    validation_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False,
    )
    
    num_classes = train_generator.num_classes
    class_indices = train_generator.class_indices
    
    logger.info(f"Found {num_classes} classes")
    logger.info(f"Training samples: {train_generator.samples}")
    logger.info(f"Validation samples: {validation_generator.samples}")
    
    return train_generator, validation_generator, num_classes, class_indices


def _build_model(
    model_name: str,
    num_classes: int,
    img_size: Tuple[int, int],
    learning_rate: float,
) -> Model:
    """Build transfer learning model"""
    
    # Select base model
    if model_name == "mobilenetv2":
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(img_size[0], img_size[1], 3),
        )
    elif model_name == "resnet50":
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(img_size[0], img_size[1], 3),
        )
    elif model_name == "efficientnet":
        base_model = EfficientNetB0(
            weights='imagenet',
            include_top=False,
            input_shape=(img_size[0], img_size[1], 3),
        )
    else:
        raise ValueError(f"Unknown model name: {model_name}")
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Add custom head
    model = Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(256, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax'),
    ])
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    logger.info(f"Model built with {model.count_params():,} parameters")
    
    return model


def _setup_callbacks(output_dir: str) -> list:
    """Setup training callbacks"""
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            filepath=os.path.join(output_dir, "fruit_classifier.h5"),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1,
        ),
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1,
        ),
        # TensorBoard logging
        TensorBoard(
            log_dir=os.path.join(output_dir, 'logs', datetime.now().strftime("%Y%m%d-%H%M%S")),
            histogram_freq=1,
        ),
    ]
    
    return callbacks


if __name__ == "__main__":
    # Example usage
    results = train_classifier(
        data_dir="./datasets/fruits-360/Training",
        model_name="mobilenetv2",
        epochs=50,
        batch_size=32,
    )
    print(f"Training results: {results['metrics']}")