"""
Train Ripeness Detector
Trains fruit ripeness detection model using TensorFlow/Keras
"""

import os
import numpy as np
from typing import Tuple, Dict, Any, Optional
from datetime import datetime

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

from app.core.config import settings
from app.utils.logger import logger


def train_ripeness_detector(
    data_dir: str,
    epochs: int = 30,
    batch_size: int = 32,
    img_size: Tuple[int, int] = (224, 224),
    learning_rate: float = 0.0001,
    validation_split: float = 0.2,
    output_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Train ripeness detection model
    
    Args:
        data_dir: Directory containing training data
        epochs: Number of training epochs
        batch_size: Batch size for training
        img_size: Target image size
        learning_rate: Learning rate for optimizer
        validation_split: Fraction of data for validation
        output_dir: Directory to save model
    
    Returns:
        Dictionary with training results
    """
    logger.info("Starting ripeness detector training")
    
    # Set output directory
    if output_dir is None:
        output_dir = os.path.dirname(settings.ML_MODEL_PATH)
    os.makedirs(output_dir, exist_ok=True)
    
    # Prepare data
    train_generator, validation_generator, num_classes, class_indices = _prepare_data(
        data_dir, img_size, batch_size, validation_split
    )
    
    # Build model
    model = _build_model(num_classes, img_size, learning_rate)
    
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
    
    # Evaluate model
    evaluation = model.evaluate(validation_generator, verbose=0)
    metrics = dict(zip(model.metrics_names, evaluation))
    
    logger.info(f"Training completed. Validation accuracy: {metrics.get('accuracy', 0):.4f}")
    
    return {
        "model_path": os.path.join(output_dir, "ripeness_model.h5"),
        "num_classes": num_classes,
        "class_indices": class_indices,
        "history": history.history,
        "metrics": metrics,
    }


def _prepare_data(
    data_dir: str,
    img_size: Tuple[int, int],
    batch_size: int,
    validation_split: float,
):
    """Prepare data generators for ripeness training"""
    
    # Expected folder structure:
    # data_dir/
    #   unripe/
    #   ripe/
    #   overripe/
    
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
    
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=validation_split,
    )
    
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True,
    )
    
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
    
    logger.info(f"Found {num_classes} ripeness classes: {list(class_indices.keys())}")
    logger.info(f"Training samples: {train_generator.samples}")
    logger.info(f"Validation samples: {validation_generator.samples}")
    
    return train_generator, validation_generator, num_classes, class_indices


def _build_model(
    num_classes: int,
    img_size: Tuple[int, int],
    learning_rate: float,
) -> Model:
    """Build ripeness detection model"""
    
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(img_size[0], img_size[1], 3),
    )
    
    # Freeze base model
    base_model.trainable = False
    
    model = Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax'),
    ])
    
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
        ModelCheckpoint(
            filepath=os.path.join(output_dir, "ripeness_model.h5"),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=8,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=4,
            min_lr=1e-6,
            verbose=1,
        ),
    ]
    
    return callbacks


if __name__ == "__main__":
    results = train_ripeness_detector(
        data_dir="./datasets/ripeness_data",
        epochs=30,
        batch_size=32,
    )
    print(f"Training results: {results['metrics']}")