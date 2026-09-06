"""
File Service
Handles file uploads, image processing, and file management
"""

import os
import uuid
import shutil
from typing import Optional
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile
from PIL import Image
import base64

from app.core.config import settings
from app.utils.logger import logger


class FileService:
    """Service for file operations"""
    
    def __init__(self):
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        directories = [
            settings.UPLOAD_DIR,
            settings.TEMP_DIR,
            settings.EXPORT_DIR,
        ]
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return os.path.splitext(filename)[1].lower()
    
    def _generate_filename(self, original_filename: str, prefix: str = "") -> str:
        """Generate unique filename"""
        extension = self._get_file_extension(original_filename)
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        if prefix:
            return f"{prefix}_{timestamp}_{unique_id}{extension}"
        return f"{timestamp}_{unique_id}{extension}"
    
    async def save_temp_file(self, file: UploadFile) -> str:
        """
        Save uploaded file to temp directory
        
        Args:
            file: UploadFile object
        
        Returns:
            Path to saved file
        """
        filename = self._generate_filename(file.filename, "temp")
        file_path = os.path.join(settings.TEMP_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Temp file saved: {file_path}")
        return file_path
    
    async def save_base64_image(self, base64_string: str) -> str:
        """
        Save base64 encoded image to temp directory
        
        Args:
            base64_string: Base64 encoded image string
        
        Returns:
            Path to saved file
        """
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Generate filename
        filename = self._generate_filename("image.jpg", "temp")
        file_path = os.path.join(settings.TEMP_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(image_data)
        
        logger.info(f"Base64 image saved: {file_path}")
        return file_path
    
    async def save_uploaded_image(self, file: UploadFile, user_id: int) -> str:
        """
        Save uploaded image to permanent storage
        
        Args:
            file: UploadFile object
            user_id: User ID for directory organization
        
        Returns:
            Path to saved file
        """
        # Create user directory
        user_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
        Path(user_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate filename
        filename = self._generate_filename(file.filename, "upload")
        file_path = os.path.join(user_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Uploaded image saved: {file_path}")
        return file_path
    
    async def save_avatar(self, file: UploadFile, user_id: int) -> str:
        """
        Save user avatar image
        
        Args:
            file: UploadFile object
            user_id: User ID
        
        Returns:
            URL path to avatar
        """
        # Create avatars directory
        avatar_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
        Path(avatar_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate filename
        filename = self._generate_filename(file.filename, f"user_{user_id}")
        file_path = os.path.join(avatar_dir, filename)
        
        # Save and resize image
        content = await file.read()
        
        # Open with PIL for resizing
        from io import BytesIO
        img = Image.open(BytesIO(content))
        
        # Resize to 200x200
        img = img.resize((200, 200), Image.Resampling.LANCZOS)
        
        # Save as JPEG
        img.save(file_path, "JPEG", quality=85)
        
        # Return URL path
        url_path = f"/static/uploads/avatars/{filename}"
        
        logger.info(f"Avatar saved: {file_path}")
        return url_path
    
    async def delete_temp_file(self, file_path: str) -> bool:
        """
        Delete temporary file
        
        Args:
            file_path: Path to file
        
        Returns:
            True if deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Temp file deleted: {file_path}")
                return True
        except Exception as e:
            logger.error(f"Failed to delete temp file {file_path}: {e}")
        
        return False
    
    async def delete_uploaded_file(self, file_path: str) -> bool:
        """
        Delete uploaded file
        
        Args:
            file_path: Path to file
        
        Returns:
            True if deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Uploaded file deleted: {file_path}")
                return True
        except Exception as e:
            logger.error(f"Failed to delete file {file_path}: {e}")
        
        return False
    
    async def get_file_size(self, file: UploadFile) -> int:
        """Get file size in bytes"""
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        return size
    
    def is_image_file(self, filename: str) -> bool:
        """Check if file is an image"""
        extension = self._get_file_extension(filename).lower()
        return extension in ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    def get_mime_type(self, filename: str) -> str:
        """Get MIME type for file"""
        extension = self._get_file_extension(filename).lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
        }
        return mime_types.get(extension, 'application/octet-stream')