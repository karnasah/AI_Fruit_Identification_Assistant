"""
Validation Utilities
Input validation functions for common data types
"""

import re
from typing import Optional, List, Tuple
from email_validator import validate_email as validate_email_lib, EmailNotValidError


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email address format
    
    Args:
        email: Email address to validate
    
    Returns:
        Tuple of (is_valid, normalized_email_or_error)
    """
    if not email:
        return False, "Email is required"
    
    try:
        # Use email-validator library for proper validation
        result = validate_email_lib(email, check_deliverability=False)
        return True, result.normalized
    except EmailNotValidError as e:
        return False, str(e)


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    
    if len(password) > 100:
        return False, "Password must be less than 100 characters"
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, None


def validate_phone(phone: str) -> Tuple[bool, Optional[str]]:
    """
    Validate phone number format
    
    Args:
        phone: Phone number to validate
    
    Returns:
        Tuple of (is_valid, normalized_phone_or_error)
    """
    if not phone:
        return True, None  # Phone is optional
    
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    
    # Check if contains only digits
    if not cleaned.isdigit():
        return False, "Phone number should contain only digits"
    
    # Check length (international numbers can be 10-15 digits)
    if len(cleaned) < 10 or len(cleaned) > 15:
        return False, "Phone number must be 10-15 digits"
    
    return True, cleaned


def validate_name(name: str, min_length: int = 2, max_length: int = 100) -> Tuple[bool, Optional[str]]:
    """
    Validate person name
    
    Args:
        name: Name to validate
        min_length: Minimum length
        max_length: Maximum length
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name:
        return False, "Name is required"
    
    if len(name) < min_length:
        return False, f"Name must be at least {min_length} characters"
    
    if len(name) > max_length:
        return False, f"Name must be less than {max_length} characters"
    
    # Allow letters, spaces, dots, and hyphens
    if not re.match(r'^[a-zA-Z\s\.\-]+$', name):
        return False, "Name can only contain letters, spaces, dots, and hyphens"
    
    return True, None


def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validate URL format
    
    Args:
        url: URL to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not url:
        return True, None  # URL is optional
    
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    
    if not url_pattern.match(url):
        return False, "Please enter a valid URL starting with http:// or https://"
    
    return True, None


def sanitize_input(text: str, max_length: int = 500) -> str:
    """
    Sanitize input text to prevent XSS and SQL injection
    
    Args:
        text: Input text
        max_length: Maximum length
    
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove special characters that could be used for injection
    text = re.sub(r'[;\'"]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Truncate
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_otp(otp: str) -> Tuple[bool, Optional[str]]:
    """
    Validate OTP code
    
    Args:
        otp: OTP code to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not otp:
        return False, "OTP is required"
    
    if not otp.isdigit():
        return False, "OTP must contain only digits"
    
    if len(otp) != 6:
        return False, "OTP must be 6 digits"
    
    return True, None


def validate_date(date_str: str, format: str = "%Y-%m-%d") -> Tuple[bool, Optional[str]]:
    """
    Validate date string
    
    Args:
        date_str: Date string to validate
        format: Expected date format
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not date_str:
        return True, None
    
    try:
        from datetime import datetime
        datetime.strptime(date_str, format)
        return True, None
    except ValueError:
        return False, f"Date must be in format {format}"


def validate_range(value: float, min_val: float, max_val: float) -> bool:
    """Validate if value is within range"""
    return min_val <= value <= max_val


def validate_enum(value: str, allowed_values: List[str]) -> bool:
    """Validate if value is in allowed list"""
    return value in allowed_values


def is_strong_password(password: str) -> bool:
    """Check if password meets strong criteria"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[@$!%*?&#]', password):
        return False
    return True