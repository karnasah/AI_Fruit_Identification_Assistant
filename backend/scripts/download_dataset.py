"""
Download Dataset
Downloads fruit image datasets for training ML models
"""

import os
import sys
import zipfile
import requests
from pathlib import Path
from typing import Optional
import asyncio

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.logger import logger


# Dataset URLs
DATASETS = {
    "fruits-360": {
        "url": "https://github.com/Horea94/Fruit-Images-Dataset/archive/refs/heads/master.zip",
        "description": "Fruits-360 dataset - 100,000+ images of 131 fruits",
        "size": "~500MB",
    },
    "fruit-recognition": {
        "url": "https://www.kaggle.com/api/v1/datasets/moltean/fruits/download",
        "description": "Fruit Recognition dataset - 90,000 images",
        "size": "~400MB",
    },
}


async def download_file(url: str, dest_path: str, description: str = "") -> bool:
    """
    Download a file with progress bar
    
    Args:
        url: Download URL
        dest_path: Destination file path
        description: Description for logging
    
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Downloading {description or dest_path}...")
        logger.info(f"URL: {url}")
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(dest_path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    if int(percent) % 10 == 0:
                        logger.info(f"Progress: {percent:.1f}%")
        
        logger.info(f"Download complete: {dest_path}")
        return True
        
    except Exception as e:
        logger.error(f"Download failed: {e}")
        return False


async def extract_zip(zip_path: str, extract_to: str) -> bool:
    """
    Extract ZIP file
    
    Args:
        zip_path: Path to ZIP file
        extract_to: Directory to extract to
    
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Extracting {zip_path} to {extract_to}...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        
        logger.info("Extraction complete")
        return True
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return False


async def download_fruits_dataset(
    dataset_name: str = "fruits-360",
    output_dir: str = "./datasets",
    extract: bool = True,
) -> Optional[str]:
    """
    Download fruits dataset
    
    Args:
        dataset_name: Name of dataset to download
        output_dir: Directory to save dataset
        extract: Whether to extract after download
    
    Returns:
        Path to extracted dataset or None if failed
    """
    if dataset_name not in DATASETS:
        logger.error(f"Unknown dataset: {dataset_name}")
        logger.info(f"Available datasets: {list(DATASETS.keys())}")
        return None
    
    dataset_info = DATASETS[dataset_name]
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Download file
    zip_path = os.path.join(output_dir, f"{dataset_name}.zip")
    download_url = dataset_info["url"]
    
    logger.info(f"Dataset: {dataset_name}")
    logger.info(f"Description: {dataset_info['description']}")
    logger.info(f"Estimated size: {dataset_info['size']}")
    
    success = await download_file(download_url, zip_path, dataset_name)
    
    if not success:
        return None
    
    if extract:
        extract_path = os.path.join(output_dir, dataset_name)
        await extract_zip(zip_path, extract_path)
        
        # Clean up zip file
        os.remove(zip_path)
        logger.info(f"Removed zip file: {zip_path}")
        
        return extract_path
    
    return zip_path


async def download_sample_dataset(output_dir: str = "./datasets") -> Optional[str]:
    """
    Download a small sample dataset for testing
    
    Args:
        output_dir: Directory to save dataset
    
    Returns:
        Path to extracted dataset or None
    """
    logger.info("Downloading sample dataset for testing...")
    
    # Create a small sample directory structure
    sample_dir = os.path.join(output_dir, "sample_fruits")
    Path(sample_dir).mkdir(parents=True, exist_ok=True)
    
    # Create class subdirectories
    classes = ["apple", "banana", "orange", "mango"]
    for cls in classes:
        Path(os.path.join(sample_dir, cls)).mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Created sample dataset structure at: {sample_dir}")
    logger.info("Note: You need to add actual images to the class folders")
    logger.info("Sample dataset created. Add images to each class folder.")
    
    return sample_dir


def check_dataset_status(dataset_path: str) -> dict:
    """
    Check dataset status
    
    Args:
        dataset_path: Path to dataset
    
    Returns:
        Dictionary with dataset information
    """
    if not os.path.exists(dataset_path):
        return {"exists": False, "message": "Dataset not found"}
    
    total_images = 0
    classes = []
    
    for item in os.listdir(dataset_path):
        item_path = os.path.join(dataset_path, item)
        if os.path.isdir(item_path):
            classes.append(item)
            image_count = len([f for f in os.listdir(item_path) if f.endswith(('.jpg', '.png', '.jpeg'))])
            total_images += image_count
    
    return {
        "exists": True,
        "path": dataset_path,
        "classes": len(classes),
        "class_names": classes,
        "total_images": total_images,
    }


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download fruit dataset")
    parser.add_argument(
        "--dataset",
        type=str,
        default="fruits-360",
        choices=list(DATASETS.keys()),
        help="Dataset to download"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./datasets",
        help="Output directory"
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Create sample dataset structure"
    )
    parser.add_argument(
        "--check",
        type=str,
        help="Check dataset status at given path"
    )
    
    args = parser.parse_args()
    
    if args.check:
        status = check_dataset_status(args.check)
        print("\nDataset Status:")
        for key, value in status.items():
            print(f"  {key}: {value}")
    elif args.sample:
        asyncio.run(download_sample_dataset(args.output))
    else:
        asyncio.run(download_fruits_dataset(args.dataset, args.output))