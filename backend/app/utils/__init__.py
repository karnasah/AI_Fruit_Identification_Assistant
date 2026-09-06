"""
Utils Package
Utility functions for logging, exceptions, helpers, and validators
"""

from app.utils.logger import setup_logging, get_logger, logger
from app.utils.exceptions import (
    AppException,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
    ValidationException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.utils.helpers import (
    format_date,
    time_ago,
    generate_uuid,
    generate_otp,
    sanitize_string,
    truncate_text,
    slugify,
    get_client_ip,
)
from app.utils.validators import (
    validate_email,
    validate_password,
    validate_phone,
    validate_url,
    sanitize_input,
)

__all__ = [
    # Logger
    "setup_logging",
    "get_logger",
    "logger",
    # Exceptions
    "AppException",
    "NotFoundException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "ConflictException",
    "ValidationException",
    "app_exception_handler",
    "http_exception_handler",
    "validation_exception_handler",
    # Helpers
    "format_date",
    "time_ago",
    "generate_uuid",
    "generate_otp",
    "sanitize_string",
    "truncate_text",
    "slugify",
    "get_client_ip",
    # Validators
    "validate_email",
    "validate_password",
    "validate_phone",
    "validate_url",
    "sanitize_input",
]