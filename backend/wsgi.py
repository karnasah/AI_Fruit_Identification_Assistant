"""
WSGI Entry Point
For production deployment with Gunicorn
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set default environment
if not os.getenv("APP_ENV"):
    os.environ["APP_ENV"] = "production"

# Import app
from main import app

# For Gunicorn
application = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "wsgi:application",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )