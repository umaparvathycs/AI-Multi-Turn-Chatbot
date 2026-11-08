
from backend.chatbot import get_response
message = "Hello! Introduce yourself."

answer = get_response(message)

print("Gemini:", answer)
