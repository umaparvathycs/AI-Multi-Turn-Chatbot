
const API_URL = "https://ai-multi-turn-chatbot.onrender.com";

// Get HTML elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat");
const chatHistory = document.getElementById("chat-history");

// Current conversation
let conversationId = null;
let isSending = false;


// Display a message
function displayMessage(message, sender) {
    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", sender);
    messageDiv.textContent = message;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement("div");

    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("message", "bot");
    typingDiv.textContent = "AI is typing...";

    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Remove typing indicator
function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");

    if (typingDiv) {
        typingDiv.remove();
    }
}


// Start a new chat
function startNewChat() {
    conversationId = null;

    chatBox.innerHTML = "";

    displayMessage(
        "Hello! I'm your AI assistant. How can I help you?",
        "bot"
    );

    userInput.value = "";
    userInput.focus();
}


// Load all conversations
async function loadChatHistory() {
    try {
        const response = await fetch(
            `${API_URL}/conversations`
        );

        if (!response.ok) {
            throw new Error("Could not load chat history.");
        }

        const conversations = await response.json();

        chatHistory.innerHTML = "";

        conversations.forEach((conversation) => {
            const historyItem = document.createElement("div");
            historyItem.classList.add("history-item");

            // Conversation title
            const title = document.createElement("span");
            title.classList.add("history-title");
            title.textContent = conversation.title || "New Chat";

            title.addEventListener("click", () => {
                openConversation(conversation.conversation_id);
            });

            // Rename button
            const renameBtn = document.createElement("button");
            renameBtn.classList.add("history-action");
            renameBtn.textContent = "Rename";

            renameBtn.addEventListener("click", (event) => {
                event.stopPropagation();

                renameConversation(
                    conversation.conversation_id,
                    conversation.title
                );
            });

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("history-action", "delete-btn");
            deleteBtn.textContent = "Delete";

            deleteBtn.addEventListener("click", (event) => {
                event.stopPropagation();

                deleteConversation(
                    conversation.conversation_id
                );
            });

            historyItem.appendChild(title);
            historyItem.appendChild(renameBtn);
            historyItem.appendChild(deleteBtn);

            chatHistory.appendChild(historyItem);
        });

    } catch (error) {
        console.error("History error:", error);
    }
}


// Open an existing conversation
async function openConversation(id) {
    try {
        const response = await fetch(
            `${API_URL}/conversations/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error("Could not open conversation.");
        }

        const data = await response.json();

        conversationId = data.conversation_id;

        chatBox.innerHTML = "";

        data.messages.forEach((message) => {
            const sender =
                message.role === "user" ? "user" : "bot";

            displayMessage(message.content, sender);
        });

        userInput.focus();

    } catch (error) {
        console.error("Open conversation error:", error);
        alert("Unable to open this conversation.");
    }
}


// Rename a conversation
async function renameConversation(id, oldTitle) {
    const newTitle = prompt(
        "Enter the new conversation name:",
        oldTitle || ""
    );

    if (newTitle === null) {
        return;
    }

    if (!newTitle.trim()) {
        alert("Conversation name cannot be empty.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/conversations/${encodeURIComponent(id)}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: newTitle.trim()
                })
            }
        );

        if (!response.ok) {
            throw new Error("Could not rename conversation.");
        }

        await loadChatHistory();

        alert("Conversation renamed successfully!");

    } catch (error) {
        console.error("Rename error:", error);
        alert("Unable to rename conversation.");
    }
}


// Delete a conversation
async function deleteConversation(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/conversations/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Could not delete conversation.");
        }

        // Clear chat if the deleted conversation is open
        if (conversationId === id) {
            startNewChat();
        }

        await loadChatHistory();

        alert("Conversation deleted successfully!");

    } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to delete conversation.");
    }
}


// Send message to Gemini
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message || isSending) {
        return;
    }

    isSending = true;
    sendBtn.disabled = true;

    // Display user message
    displayMessage(message, "user");

    userInput.value = "";

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch(
            `${API_URL}/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message,
                    conversation_id: conversationId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Something went wrong."
            );
        }

        // Save conversation ID
        conversationId = data.conversation_id;

        // Remove typing indicator
        removeTypingIndicator();

        // Display AI response
        displayMessage(data.reply, "bot");

        // Refresh sidebar history
        await loadChatHistory();

    } catch (error) {
        console.error("Chat error:", error);

        removeTypingIndicator();

        displayMessage(
            "Sorry, something went wrong. Please try again. " +
            error.message,
            "bot"
        );

    } finally {
        isSending = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}


// Button events
sendBtn.addEventListener("click", sendMessage);

newChatBtn.addEventListener("click", startNewChat);


// Send message using Enter key
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});


// Load chat history when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();
});
