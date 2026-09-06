"""
Hyperparameter Tuning
Optimizes hyperparameters for ML models using various strategies
"""

import itertools
import numpy as np
from typing import Dict, Any, List, Tuple, Optional, Callable
from dataclasses import dataclass, field
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam, SGD, RMSprop
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

from app.utils.logger import logger


@dataclass
class HyperparameterConfig:
    """Configuration for hyperparameter tuning"""
    
    # Learning rates to try
    learning_rates: List[float] = field(default_factory=lambda: [0.001, 0.0005, 0.0001])
    
    # Batch sizes to try
    batch_sizes: List[int] = field(default_factory=lambda: [16, 32, 64])
    
    # Dropout rates to try
    dropout_rates: List[float] = field(default_factory=lambda: [0.3, 0.5, 0.7])
    
    # Optimizers to try
    optimizers: List[str] = field(default_factory=lambda: ["adam", "sgd", "rmsprop"])
    
    # Number of units in dense layers
    dense_units: List[int] = field(default_factory=lambda: [128, 256, 512])
    
    # Whether to use batch normalization
    use_batch_norm: List[bool] = field(default_factory=lambda: [True, False])
    
    # L2 regularization values
    l2_reg: List[float] = field(default_factory=lambda: [0, 0.0001, 0.001])


class HyperparameterTuner:
    """Hyperparameter optimization for ML models"""
    
    def __init__(self, model_builder: Callable, config: Optional[HyperparameterConfig] = None):
        """
        Initialize hyperparameter tuner
        
        Args:
            model_builder: Function that builds model with given hyperparameters
            config: Hyperparameter configuration
        """
        self.model_builder = model_builder
        self.config = config or HyperparameterConfig()
        self.results = []
    
    def grid_search(
        self,
        train_data: Tuple[np.ndarray, np.ndarray],
        val_data: Tuple[np.ndarray, np.ndarray],
        epochs: int = 20,
        verbose: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Perform grid search over hyperparameters
        
        Args:
            train_data: Tuple of (X_train, y_train)
            val_data: Tuple of (X_val, y_val)
            epochs: Number of epochs per trial
            verbose: Whether to print progress
        
        Returns:
            List of results for each combination
        """
        X_train, y_train = train_data
        X_val, y_val = val_data
        
        # Generate all combinations
        combinations = list(itertools.product(
            self.config.learning_rates,
            self.config.batch_sizes,
            self.config.dropout_rates,
            self.config.optimizers,
            self.config.dense_units,
            self.config.use_batch_norm,
            self.config.l2_reg,
        ))
        
        logger.info(f"Starting grid search with {len(combinations)} combinations")
        
        for i, (lr, batch_size, dropout, optimizer_name, units, use_bn, l2) in enumerate(combinations):
            if verbose:
                logger.info(f"Trial {i+1}/{len(combinations)}: lr={lr}, batch_size={batch_size}, "
                           f"dropout={dropout}, optimizer={optimizer_name}, units={units}, bn={use_bn}, l2={l2}")
            
            # Build model
            model = self.model_builder(
                learning_rate=lr,
                dropout_rate=dropout,
                optimizer_name=optimizer_name,
                dense_units=units,
                use_batch_norm=use_bn,
                l2_reg=l2,
            )
            
            # Create batch generator
            train_gen = self._batch_generator(X_train, y_train, batch_size)
            val_gen = self._batch_generator(X_val, y_val, batch_size)
            
            # Train model
            history = model.fit(
                train_gen,
                steps_per_epoch=len(X_train) // batch_size,
                validation_data=val_gen,
                validation_steps=len(X_val) // batch_size,
                epochs=epochs,
                verbose=0,
                callbacks=[
                    EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
                    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3),
                ],
            )
            
            # Record results
            result = {
                "hyperparameters": {
                    "learning_rate": lr,
                    "batch_size": batch_size,
                    "dropout_rate": dropout,
                    "optimizer": optimizer_name,
                    "dense_units": units,
                    "use_batch_norm": use_bn,
                    "l2_reg": l2,
                },
                "best_val_accuracy": max(history.history.get('val_accuracy', [0])),
                "best_val_loss": min(history.history.get('val_loss', [float('inf')])),
                "final_epoch": len(history.history.get('loss', [])),
            }
            
            self.results.append(result)
            
            if verbose:
                logger.info(f"  Best val accuracy: {result['best_val_accuracy']:.4f}")
        
        return self.results
    
    def random_search(
        self,
        train_data: Tuple[np.ndarray, np.ndarray],
        val_data: Tuple[np.ndarray, np.ndarray],
        n_trials: int = 20,
        epochs: int = 20,
        verbose: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Perform random search over hyperparameters
        
        Args:
            train_data: Tuple of (X_train, y_train)
            val_data: Tuple of (X_val, y_val)
            n_trials: Number of random trials
            epochs: Number of epochs per trial
            verbose: Whether to print progress
        
        Returns:
            List of results for each trial
        """
        import random
        
        X_train, y_train = train_data
        X_val, y_val = val_data
        
        logger.info(f"Starting random search with {n_trials} trials")
        
        for i in range(n_trials):
            # Sample random hyperparameters
            lr = random.choice(self.config.learning_rates)
            batch_size = random.choice(self.config.batch_sizes)
            dropout = random.choice(self.config.dropout_rates)
            optimizer_name = random.choice(self.config.optimizers)
            units = random.choice(self.config.dense_units)
            use_bn = random.choice(self.config.use_batch_norm)
            l2 = random.choice(self.config.l2_reg)
            
            if verbose:
                logger.info(f"Trial {i+1}/{n_trials}: lr={lr}, batch_size={batch_size}, "
                           f"dropout={dropout}, optimizer={optimizer_name}")
            
            # Build model
            model = self.model_builder(
                learning_rate=lr,
                dropout_rate=dropout,
                optimizer_name=optimizer_name,
                dense_units=units,
                use_batch_norm=use_bn,
                l2_reg=l2,
            )
            
            # Train model
            history = model.fit(
                X_train, y_train,
                batch_size=batch_size,
                validation_data=(X_val, y_val),
                epochs=epochs,
                verbose=0,
                callbacks=[EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)],
            )
            
            # Record results
            result = {
                "hyperparameters": {
                    "learning_rate": lr,
                    "batch_size": batch_size,
                    "dropout_rate": dropout,
                    "optimizer": optimizer_name,
                    "dense_units": units,
                    "use_batch_norm": use_bn,
                    "l2_reg": l2,
                },
                "best_val_accuracy": max(history.history.get('val_accuracy', [0])),
                "best_val_loss": min(history.history.get('val_loss', [float('inf')])),
            }
            
            self.results.append(result)
        
        return self.results
    
    def get_best_parameters(self) -> Dict[str, Any]:
        """Get the best hyperparameters from tuning results"""
        if not self.results:
            return {}
        
        best_result = max(self.results, key=lambda x: x.get('best_val_accuracy', 0))
        return best_result.get('hyperparameters', {})
    
    def _batch_generator(self, X, y, batch_size):
        """Generate batches of data"""
        n_samples = len(X)
        indices = np.random.permutation(n_samples)
        
        for start in range(0, n_samples, batch_size):
            end = min(start + batch_size, n_samples)
            batch_indices = indices[start:end]
            yield X[batch_indices], y[batch_indices]


def get_optimizer(name: str, learning_rate: float):
    """Get optimizer by name"""
    optimizers = {
        "adam": Adam(learning_rate=learning_rate),
        "sgd": SGD(learning_rate=learning_rate, momentum=0.9, nesterov=True),
        "rmsprop": RMSprop(learning_rate=learning_rate),
    }
    return optimizers.get(name, Adam(learning_rate=learning_rate))


if __name__ == "__main__":
    # Example usage
    def dummy_model_builder(**kwargs):
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Dense, Dropout
        
        model = Sequential([
            Dense(kwargs.get('dense_units', 128), activation='relu', input_shape=(100,)),
            Dropout(kwargs.get('dropout_rate', 0.5)),
            Dense(10, activation='softmax'),
        ])
        
        optimizer = get_optimizer(kwargs.get('optimizer_name', 'adam'), kwargs.get('learning_rate', 0.001))
        model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['accuracy'])
        
        return model
    
    # Create dummy data
    X_train = np.random.randn(1000, 100)
    y_train = np.random.randint(0, 10, 1000)
    X_val = np.random.randn(200, 100)
    y_val = np.random.randint(0, 10, 200)
    
    # Run tuner
    tuner = HyperparameterTuner(dummy_model_builder)
    results = tuner.random_search(
        train_data=(X_train, y_train),
        val_data=(X_val, y_val),
        n_trials=5,
        epochs=5,
    )
    
    print(f"Best parameters: {tuner.get_best_parameters()}")