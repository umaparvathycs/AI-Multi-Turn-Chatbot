
from google import genai
from google.genai import types

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

# Connect to Gemini
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={
        "timeout": 30000
    }
)

# Define chatbot personality
SYSTEM_PROMPT = """
You are a friendly AI assistant.

You explain concepts in simple language.
You are helpful, polite and accurate.
You remember previous messages in the conversation.
"""

def get_response(user_message, history=None):

    if history is None:
        history = []

    # Convert previous messages into Gemini format
    contents = []

    for message in history:
        contents.append(
            types.Content(
                role=message["role"],
                parts=[types.Part.from_text(text=message["content"])]
            )
        )

    # Add the current user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)]
        )
    )

    # Generate response using Gemini
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT
        )
    )

    return response.text
