"""
Train Fruit Classifier Model
Trains a CNN model on the Fruits-360 dataset
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

print("=" * 60)
print("🍎 FRUIT CLASSIFIER TRAINING")
print("=" * 60)

# ============================================
# CONFIGURATION
# ============================================

# Update this path to your actual dataset location
DATASET_PATH = r"C:\Users\karna\Desktop\mega project\AI_Fruit_Identification_Assistant\ml_workspace\datasets\fruits-360_100x100"

# If the above doesn't work, try these alternatives:
# DATASET_PATH = r"C:\Users\karna\Desktop\mega project\AI_Fruit_Identification_Assistant\ml_workspace\datasets\fruits-360"
# DATASET_PATH = r"C:\Users\karna\Desktop\mega project\AI_Fruit_Identification_Assistant\ml_workspace\datasets\fruits-360_multi"

MODEL_SAVE_PATH = r"C:\Users\karna\Desktop\mega project\AI_Fruit_Identification_Assistant\backend\app\ml\models\fruit_classifier.h5"
LABELS_SAVE_PATH = r"C:\Users\karna\Desktop\mega project\AI_Fruit_Identification_Assistant\backend\app\ml\models\class_labels.json"

# Training parameters
IMG_SIZE = (100, 100)
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.001

# ============================================
# CHECK DATASET
# ============================================

print("\n📂 Checking dataset...")

train_path = os.path.join(DATASET_PATH, "Training")
test_path = os.path.join(DATASET_PATH, "Test")

# Try alternative folder names
if not os.path.exists(train_path):
    # Try different folder structures
    possible_paths = [
        os.path.join(DATASET_PATH, "fruits-360/Training"),
        os.path.join(DATASET_PATH, "Training"),
        os.path.join(DATASET_PATH, "train"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            train_path = p
            test_path = p.replace("Training", "Test").replace("train", "test")
            break

if not os.path.exists(train_path):
    print(f"\n❌ ERROR: Training folder not found!")
    print(f"   Looked in: {DATASET_PATH}")
    print(f"\n📁 Please check your dataset location and update DATASET_PATH in this script.")
    print(f"   Current dataset path: {DATASET_PATH}")
    print(f"\n   Your dataset should have a 'Training' folder with fruit subfolders.")
    sys.exit(1)

# Count classes and samples
classes = sorted([d for d in os.listdir(train_path) if os.path.isdir(os.path.join(train_path, d))])
num_classes = len(classes)

print(f"✅ Found {num_classes} fruit classes")
print(f"   Training path: {train_path}")
print(f"   Test path: {test_path}")

# Count samples
train_samples = 0
for c in classes[:5]:  # Show first 5 classes
    count = len(os.listdir(os.path.join(train_path, c)))
    train_samples += count
    print(f"   - {c}: {count} images")

print(f"\n   Total training samples: {train_samples}+")

# ============================================
# DATA GENERATORS
# ============================================

print("\n🔄 Creating data generators...")

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.1
)

test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_generator = train_datagen.flow_from_directory(
    train_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

if os.path.exists(test_path):
    test_generator = test_datagen.flow_from_directory(
        test_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    has_test = True
else:
    print("⚠️ Test folder not found, using validation for testing")
    test_generator = val_generator
    has_test = False

print(f"\n✅ Training samples: {train_generator.samples}")
print(f"✅ Validation samples: {val_generator.samples}")
if has_test:
    print(f"✅ Test samples: {test_generator.samples}")

# Save class labels
class_indices = train_generator.class_indices
class_labels = {str(v): k for k, v in class_indices.items()}

# ============================================
# BUILD MODEL
# ============================================

print("\n🏗️ Building model...")

# Use MobileNetV2 as base (lightweight and accurate)
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
)

# Freeze base model layers initially
base_model.trainable = False

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"✅ Model built with {model.count_params():,} parameters")

# ============================================
# CALLBACKS
# ============================================

print("\n📊 Setting up callbacks...")

# Create model directory if not exists
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )
]

# ============================================
# TRAIN MODEL
# ============================================

print("\n🏋️ Starting training...")
print(f"   Epochs: {EPOCHS}")
print(f"   Batch size: {BATCH_SIZE}")
print(f"   Learning rate: {LEARNING_RATE}")
print("=" * 60)

history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
    verbose=1
)

# ============================================
# EVALUATE
# ============================================

print("\n📊 Evaluating model...")

train_loss, train_acc = model.evaluate(train_generator, verbose=0)
val_loss, val_acc = model.evaluate(val_generator, verbose=0)

print(f"\n📈 Training Accuracy: {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"📈 Validation Accuracy: {val_acc:.4f} ({val_acc*100:.2f}%)")

if has_test:
    test_loss, test_acc = model.evaluate(test_generator, verbose=0)
    print(f"📈 Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")

# ============================================
# SAVE MODEL AND LABELS
# ============================================

print("\n💾 Saving model and labels...")

# Save class labels
with open(LABELS_SAVE_PATH, 'w') as f:
    json.dump(class_labels, f, indent=2)

print(f"✅ Model saved to: {MODEL_SAVE_PATH}")
print(f"✅ Class labels saved to: {LABELS_SAVE_PATH}")

# ============================================
# SUMMARY
# ============================================

print("\n" + "=" * 60)
print("🎉 TRAINING COMPLETE! 🎉")
print("=" * 60)

print(f"\n📊 Final Results:")
print(f"   Training Accuracy: {train_acc*100:.2f}%")
print(f"   Validation Accuracy: {val_acc*100:.2f}%")

print(f"\n📁 Files created:")
print(f"   1. Model: {MODEL_SAVE_PATH}")
print(f"   2. Labels: {LABELS_SAVE_PATH}")

print("\n🚀 NEXT STEPS:")
print("   1. Set MOCK_ML_MODEL=False in backend/.env")
print("   2. Restart backend: python backend/main.py")
print("   3. Test fruit identification!")