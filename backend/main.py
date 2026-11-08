
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

from backend.chatbot import get_response
from backend.database import (
    create_tables,
    save_conversation,
    save_message,
    get_conversation_history,
    get_all_conversations,
    rename_conversation,
    delete_conversation
)

app = FastAPI(
    title="AI Multi-Turn Chatbot",
    description="A chatbot powered by Google Gemini",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables when the application starts
@app.on_event("startup")
def startup():
    create_tables()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Multi-Turn Chatbot!"
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id or str(uuid4())

        # Get previous messages from SQLite
        history = get_conversation_history(conversation_id)

        # Generate AI response
        answer = get_response(request.message, history)

        if not answer:
            raise HTTPException(
                status_code=502,
                detail="AI returned an empty response."
            )

        # Save the conversation and messages
        save_conversation(
            conversation_id,
            request.message[:50]
        )

        save_message(conversation_id, "user", request.message)
        save_message(conversation_id, "model", answer)

        return ChatResponse(
            reply=answer,
            conversation_id=conversation_id
        )

    except HTTPException:
        raise

    except Exception as error:
        print("Chatbot error:", error)
        raise HTTPException(
            status_code=502,
            detail="Sorry, the AI service is temporarily unavailable."
        )


# Get all saved conversations
@app.get("/conversations")
def conversations():
    return get_all_conversations()


# Get messages from a particular conversation
@app.get("/conversations/{conversation_id}")
def conversation_details(conversation_id: str):
    history = get_conversation_history(conversation_id)

    return {
        "conversation_id": conversation_id,
        "messages": history
    }
# Rename an existing conversation
@app.put("/conversations/{conversation_id}")
def rename_chat(conversation_id: str, request: dict):

    new_title = request.get("title", "").strip()

    if not new_title:
        raise HTTPException(
            status_code=400,
            detail="Conversation title cannot be empty."
        )

    if len(new_title) > 100:
        raise HTTPException(
            status_code=400,
            detail="Title cannot exceed 100 characters."
        )

    updated = rename_conversation(conversation_id, new_title)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    return {"message": "Conversation renamed successfully."}


# Delete an existing conversation
@app.delete("/conversations/{conversation_id}")
def delete_chat(conversation_id: str):

    deleted = delete_conversation(conversation_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    return {"message": "Conversation deleted successfully."}