"""
Email Tasks
Background tasks for sending emails asynchronously
"""

import asyncio
from typing import Optional
from datetime import datetime

from app.core.config import settings
from app.utils.logger import logger


async def send_email_task(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None,
) -> bool:
    """
    Background task to send email asynchronously
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text email body
        html_body: Optional HTML email body
    
    Returns:
        True if sent successfully, False otherwise
    """
    logger.info(f"Sending email to {to_email}: {subject}")
    
    try:
        # Simulate email sending (replace with actual SMTP in production)
        await asyncio.sleep(1)  # Simulate network delay
        
        # In production, use actual email service like:
        # import smtplib
        # from email.mime.text import MIMEText
        # from email.mime.multipart import MIMEMultipart
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_verification_email_task(
    to_email: str,
    name: str,
    verification_token: str,
) -> bool:
    """
    Send email verification link to user
    
    Args:
        to_email: User email address
        name: User name
        verification_token: Email verification token
    
    Returns:
        True if sent successfully, False otherwise
    """
    subject = "Verify Your Email - Fruit AI Assistant"
    
    verification_url = f"{settings.APP_URL}/verify-email?token={verification_token}"
    
    body = f"""
    Hello {name},
    
    Thank you for registering with Fruit AI Assistant!
    
    Please verify your email address by clicking the link below:
    {verification_url}
    
    This link will expire in 24 hours.
    
    If you did not create an account, please ignore this email.
    
    Best regards,
    Fruit AI Assistant Team
    """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f57d19, #19821e); color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .button {{ display: inline-block; background: #f57d19; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍎 Fruit AI Assistant</h1>
            </div>
            <div class="content">
                <h2>Hello {name},</h2>
                <p>Thank you for registering with Fruit AI Assistant!</p>
                <p>Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" class="button">Verify Email</a>
                </p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Fruit AI Assistant. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email_task(to_email, subject, body, html_body)


async def send_password_reset_email_task(
    to_email: str,
    name: str,
    reset_token: str,
) -> bool:
    """
    Send password reset link to user
    
    Args:
        to_email: User email address
        name: User name
        reset_token: Password reset token
    
    Returns:
        True if sent successfully, False otherwise
    """
    subject = "Reset Your Password - Fruit AI Assistant"
    
    reset_url = f"{settings.APP_URL}/reset-password?token={reset_token}"
    
    body = f"""
    Hello {name},
    
    We received a request to reset your password for Fruit AI Assistant.
    
    Click the link below to reset your password:
    {reset_url}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email.
    
    Best regards,
    Fruit AI Assistant Team
    """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
   <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f57d19, #19821e); color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .button {{ display: inline-block; background: #f57d19; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍎 Fruit AI Assistant</h1>
            </div>
            <div class="content">
                <h2>Hello {name},</h2>
                <p>We received a request to reset your password.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Fruit AI Assistant. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email_task(to_email, subject, body, html_body)


async def send_welcome_email_task(
    to_email: str,
    name: str,
) -> bool:
    """
    Send welcome email to new user
    
    Args:
        to_email: User email address
        name: User name
    
    Returns:
        True if sent successfully, False otherwise
    """
    subject = "Welcome to Fruit AI Assistant! 🍎"
    
    body = f"""
    Hello {name},
    
    Welcome to Fruit AI Assistant!
    
    Here's what you can do:
    - Identify fruits by uploading images or using live camera
    - Get detailed nutritional information
    - Discover seasonal fruits and recipes
    - Save your favorite fruits
    - Track your identification history
    
    Get started by identifying your first fruit!
    
    Best regards,
    Fruit AI Assistant Team
    """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f57d19, #19821e); color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .features {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }}
            .feature {{ flex: 1; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 10px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍎 Fruit AI Assistant</h1>
            </div>
            <div class="content">
                <h2>Welcome, {name}! 🎉</h2>
                <p>Thank you for joining Fruit AI Assistant!</p>
                <div class="features">
                    <div class="feature">📸 Identify Fruits</div>
                    <div class="feature">🥗 Nutritional Info</div>
                    <div class="feature">📅 Seasonal Fruits</div>
                    <div class="feature">🍳 Recipe Ideas</div>
                </div>
                <p>Get started by identifying your first fruit!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Fruit AI Assistant. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email_task(to_email, subject, body, html_body)