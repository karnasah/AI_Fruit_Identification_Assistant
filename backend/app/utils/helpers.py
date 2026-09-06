"""
Helper Functions
Utility functions for common operations
"""

import re
import uuid
import random
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any, Dict, List
from urllib.parse import urlparse
from fastapi import Request


def format_date(date: datetime, format_type: str = "datetime") -> str:
    """
    Format datetime to readable string
    
    Args:
        date: Datetime object
        format_type: Format type (date, time, datetime, full)
    
    Returns:
        Formatted date string
    """
    if not date:
        return "N/A"
    
    if format_type == "date":
        return date.strftime("%Y-%m-%d")
    elif format_type == "time":
        return date.strftime("%H:%M:%S")
    elif format_type == "full":
        return date.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return date.strftime("%Y-%m-%d %H:%M:%S")


def time_ago(date: datetime) -> str:
    """
    Get human-readable time ago string
    
    Args:
        date: Past datetime
    
    Returns:
        String like "5 minutes ago"
    """
    if not date:
        return "N/A"
    
    now = datetime.utcnow()
    delta = now - date
    
    if delta.days > 365:
        years = delta.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"
    if delta.days > 30:
        months = delta.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    if delta.days > 7:
        weeks = delta.days // 7
        return f"{weeks} week{'s' if weeks > 1 else ''} ago"
    if delta.days > 0:
        return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
    if delta.seconds > 3600:
        hours = delta.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    if delta.seconds > 60:
        minutes = delta.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    return "just now"


def generate_uuid() -> str:
    """Generate a UUID string"""
    return str(uuid.uuid4())


def generate_otp(length: int = 6) -> str:
    """
    Generate a numeric OTP
    
    Args:
        length: Length of OTP (default 6)
    
    Returns:
        OTP string
    """
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def generate_verification_code() -> str:
    """Generate a verification code"""
    return generate_otp(6)


def generate_reset_token() -> str:
    """Generate a password reset token"""
    return generate_uuid()


def sanitize_string(text: str, max_length: int = 500) -> str:
    """
    Sanitize input string
    
    Args:
        text: Input text
        max_length: Maximum length
    
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Truncate
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to maximum length
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to add when truncated
    
    Returns:
        Truncated text
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def slugify(text: str) -> str:
    """
    Convert string to URL-friendly slug
    
    Args:
        text: Input text
    
    Returns:
        Slug string
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    
    # Remove special characters
    text = re.sub(r'[^a-z0-9-]', '', text)
    
    # Remove multiple hyphens
    text = re.sub(r'-+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text


def get_client_ip(request: Request) -> str:
    """
    Get client IP address from request
    
    Args:
        request: FastAPI request object
    
    Returns:
        Client IP address
    """
    # Check for proxy headers
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    """Get user agent from request"""
    return request.headers.get("User-Agent", "unknown")


def is_valid_url(url: str) -> bool:
    """Check if URL is valid"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def extract_domain_from_url(url: str) -> str:
    """Extract domain from URL"""
    try:
        result = urlparse(url)
        return result.netloc
    except Exception:
        return ""


def calculate_confidence_percentage(confidence: float) -> int:
    """Convert confidence score to percentage"""
    return int(confidence * 100)


def get_confidence_level(confidence: float) -> str:
    """Get confidence level based on score"""
    if confidence >= 0.8:
        return "high"
    elif confidence >= 0.6:
        return "medium"
    else:
        return "low"


def merge_dicts(dict1: Dict, dict2: Dict) -> Dict:
    """Merge two dictionaries"""
    result = dict1.copy()
    result.update(dict2)
    return result


def chunk_list(items: List, chunk_size: int) -> List[List]:
    """Split a list into chunks"""
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    if '.' not in filename:
        return ""
    return filename.rsplit('.', 1)[1].lower()


def is_image_filename(filename: str) -> bool:
    """Check if filename has image extension"""
    image_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'}
    ext = get_file_extension(filename)
    return ext in image_extensions


def safe_divide(a: float, b: float, default: float = 0.0) -> float:
    """Safely divide two numbers"""
    try:
        return a / b if b != 0 else default
    except Exception:
        return default