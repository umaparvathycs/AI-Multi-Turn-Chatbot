
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite"
)

if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
    raise ValueError(
        "GEMINI_API_KEY is missing. "
        "Check the Environment Variables in Render."
    )
