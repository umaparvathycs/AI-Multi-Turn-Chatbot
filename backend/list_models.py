
from backend.chatbot import client

print("Checking available Gemini models...\n")

for model in client.models.list():
    if "generateContent" in model.supported_actions:
        print(model.name)
