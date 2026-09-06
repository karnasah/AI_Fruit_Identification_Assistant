"""
Train Disease Detector
Trains fruit disease detection model using TensorFlow/Keras
"""

import os
import numpy as np
from typing import Tuple, Dict, Any, Optional
from datetime import datetime

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

from app.core.config import settings
from app.utils.logger import logger


def train_disease_detector(
    data_dir: str,
    epochs: int = 40,
    batch_size: int = 32,
    img_size: Tuple[int, int] = (224, 224),
    learning_rate: float = 0.0001,
    validation_split: float = 0.2,
    output_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Train disease detection model
    
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
    logger.info("Starting disease detector training")
    
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
        "model_path": os.path.join(output_dir, "disease_model.h5"),
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
    """Prepare data generators for disease training"""
    
    # Expected folder structure:
    # data_dir/
    #   healthy/
    #   apple_scab/
    #   black_rot/
    #   powdery_mildew/
    #   etc.
    
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
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
    
    logger.info(f"Found {num_classes} disease classes: {list(class_indices.keys())}")
    logger.info(f"Training samples: {train_generator.samples}")
    logger.info(f"Validation samples: {validation_generator.samples}")
    
    return train_generator, validation_generator, num_classes, class_indices


def _build_model(
    num_classes: int,
    img_size: Tuple[int, int],
    learning_rate: float,
) -> Model:
    """Build disease detection model using ResNet50"""
    
    base_model = ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=(img_size[0], img_size[1], 3),
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
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
    
    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'precision', 'recall'],
    )
    
    logger.info(f"Model built with {model.count_params():,} parameters")
    
    return model


def _setup_callbacks(output_dir: str) -> list:
    """Setup training callbacks"""
    
    callbacks = [
        ModelCheckpoint(
            filepath=os.path.join(output_dir, "disease_model.h5"),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1,
        ),
    ]
    
    return callbacks


def fine_tune_model(
    model_path: str,
    data_dir: str,
    epochs: int = 20,
    batch_size: int = 32,
) -> Dict[str, Any]:
    """
    Fine-tune an existing disease detection model
    
    Args:
        model_path: Path to existing model
        data_dir: Directory with new training data
        epochs: Number of fine-tuning epochs
        batch_size: Batch size
    
    Returns:
        Dictionary with fine-tuning results
    """
    from tensorflow.keras.models import load_model
    
    logger.info(f"Fine-tuning model from {model_path}")
    
    # Load existing model
    model = load_model(model_path)
    
    # Unfreeze some layers for fine-tuning
    model.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    # Prepare data
    train_generator, validation_generator, num_classes, _ = _prepare_data(
        data_dir, (224, 224), batch_size, 0.2
    )
    
    # Fine-tune
    history = model.fit(
        train_generator,
        validation_data=validation_generator,
        epochs=epochs,
        verbose=1,
    )
    
    # Save fine-tuned model
    output_dir = os.path.dirname(model_path)
    model.save(os.path.join(output_dir, "disease_model_finetuned.h5"))
    
    return {
        "model_path": os.path.join(output_dir, "disease_model_finetuned.h5"),
        "history": history.history,
    }


if __name__ == "__main__":
    results = train_disease_detector(
        data_dir="./datasets/disease_data",
        epochs=40,
        batch_size=32,
    )
    print(f"Training results: {results['metrics']}")