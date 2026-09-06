"""
Logging Utility
Configures application logging with file and console output
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

from app.core.config import settings


# Log format strings
CONSOLE_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
FILE_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(log_file: Optional[str] = None) -> None:
    """
    Setup application logging configuration
    
    Args:
        log_file: Path to log file (defaults to settings.LOG_FILE)
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    if log_file is None:
        log_file = settings.LOG_FILE
    
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(logging.Formatter(CONSOLE_FORMAT, DATE_FORMAT))
    root_logger.addHandler(console_handler)
    
    # File handler
    try:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(log_level)
        file_handler.setFormatter(logging.Formatter(FILE_FORMAT, DATE_FORMAT))
        root_logger.addHandler(file_handler)
    except Exception as e:
        root_logger.warning(f"Could not create file handler: {e}")
    
    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    root_logger.info(f"Logging initialized at {log_level} level")
    root_logger.info(f"Log file: {log_file}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module
    
    Args:
        name: Logger name (usually __name__)
    
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


# Create default logger instance
logger = get_logger(__name__)


class LogContext:
    """Context manager for logging execution time"""
    
    def __init__(self, logger: logging.Logger, operation: str):
        self.logger = logger
        self.operation = operation
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        self.logger.info(f"Starting: {self.operation}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        if exc_type:
            self.logger.error(f"Failed: {self.operation} - {exc_val} (took {duration:.2f}s)")
        else:
            self.logger.info(f"Completed: {self.operation} (took {duration:.2f}s)")
        return False