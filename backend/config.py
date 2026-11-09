
import os
from dotenv import load_dotenv

# Load local .env file (if available)
load_dotenv()

# Read environment variables
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite"
)

# Validate API key
if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
    raise ValueError(
        "GEMINI_API_KEY is missing. "
        "Please configure it in Render Environment Variables "
        "or your local .env file."
    )
