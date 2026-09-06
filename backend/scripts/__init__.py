"""
Scripts Package
Utility scripts for database initialization, seeding, and model evaluation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.scripts.init_db import init_database
from backend.scripts.seed_data import seed_database
from backend.scripts.download_dataset import download_fruits_dataset
from backend.scripts.evaluate_model import evaluate_model

__all__ = [
    "init_database",
    "seed_database",
    "download_fruits_dataset",
    "evaluate_model",
]