
# Store conversations separately
conversations = {}

# Maximum number of previous messages to retain
MAX_HISTORY = 10


def get_history(conversation_id):
    """Get the history of a conversation."""

    return conversations.get(conversation_id, [])


def save_message(conversation_id, user_message, bot_reply):
    """Save user message and AI response."""

    if conversation_id not in conversations:
        conversations[conversation_id] = []

    history = conversations[conversation_id]

    # Save both sides of the conversation
    history.append({
        "role": "user",
        "content": user_message
    })

    history.append({
        "role": "model",
        "content": bot_reply
    })

    # Keep only the latest 10 messages
    conversations[conversation_id] = history[-MAX_HISTORY:]
