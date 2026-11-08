
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat");
const chatHistory = document.getElementById("chat-history");

let conversationId = null;

// Display messages
function displayMessage(message, sender) {
    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", sender);
    messageDiv.textContent = message;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
    removeTypingIndicator();

    const typingDiv = document.createElement("div");

    typingDiv.classList.add("message", "bot");
    typingDiv.id = "typing-indicator";
    typingDiv.textContent = "AI is typing...";

    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");

    if (indicator) {
        indicator.remove();
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

    userInput.focus();
}

// Load chat history
async function loadChatHistory() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8000/conversations"
        );

        if (!response.ok) {
            throw new Error("Could not load chat history");
        }

        const conversations = await response.json();

        chatHistory.innerHTML = "";

        conversations.forEach(conversation => {
            const item = document.createElement("div");
            item.classList.add("history-item");

            const title = document.createElement("span");
            title.classList.add("history-title");
            title.textContent = conversation.title || "New Chat";

            // Open conversation when title is clicked
            title.addEventListener("click", () => {
                openConversation(conversation.conversation_id);
            });

            // Rename button
            const renameBtn = document.createElement("button");
            renameBtn.textContent = "Rename";
            renameBtn.classList.add("history-action");

            renameBtn.addEventListener("click", async (event) => {
                event.stopPropagation();

                const newTitle = prompt(
                    "Enter a new conversation title:",
                    conversation.title
                );

                if (newTitle === null) return;

                if (!newTitle.trim()) {
                    alert("Title cannot be empty.");
                    return;
                }

                try {
                    const renameResponse = await fetch(
                        `http://127.0.0.1:8000/conversations/${conversation.conversation_id}`,
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

                    if (!renameResponse.ok) {
                        throw new Error("Rename failed");
                    }

                    await loadChatHistory();
                    alert("Conversation renamed successfully!");

                } catch (error) {
                    console.error(error);
                    alert("Could not rename conversation.");
                }
            });

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("history-action", "delete-btn");

            deleteBtn.addEventListener("click", async (event) => {
                event.stopPropagation();

                const confirmDelete = confirm(
                    "Are you sure you want to delete this conversation?"
                );

                if (!confirmDelete) return;

                try {
                    const deleteResponse = await fetch(
                        `http://127.0.0.1:8000/conversations/${conversation.conversation_id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    if (!deleteResponse.ok) {
                        throw new Error("Delete failed");
                    }

                    // Clear chat if the deleted conversation is open
                    if (conversationId === conversation.conversation_id) {
                        conversationId = null;
                        chatBox.innerHTML = "";

                        displayMessage(
                            "Hello! I'm your AI assistant. How can I help you?",
                            "bot"
                        );
                    }

                    await loadChatHistory();

                } catch (error) {
                    console.error(error);
                    alert("Could not delete conversation.");
                }
            });

            item.appendChild(title);
            item.appendChild(renameBtn);
            item.appendChild(deleteBtn);

            chatHistory.appendChild(item);
        });

    } catch (error) {
        console.error("History error:", error);
    }
}

// Open an old conversation
async function openConversation(id) {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/conversations/${id}`
        );

        if (!response.ok) {
            throw new Error("Could not open conversation");
        }

        const data = await response.json();

        conversationId = data.conversation_id;
        chatBox.innerHTML = "";

        data.messages.forEach(message => {
            const sender =
                message.role === "user" ? "user" : "bot";

            displayMessage(message.content, sender);
        });

    } catch (error) {
        console.error(error);

        displayMessage(
            "Could not load this conversation.",
            "bot"
        );
    }
}

// Send message
async function sendMessage() {
    const message = userInput.value.trim();

    if (message === "" || sendBtn.disabled) return;

    displayMessage(message, "user");
    userInput.value = "";

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    showTypingIndicator();

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/chat",
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

        if (!response.ok) {
            throw new Error("Backend request failed");
        }

        const data = await response.json();

        removeTypingIndicator();

        conversationId = data.conversation_id;

        displayMessage(data.reply, "bot");

        await loadChatHistory();

    } catch (error) {
        console.error(error);

        removeTypingIndicator();

        displayMessage(
            "Sorry, something went wrong. Please check the backend.",
            "bot"
        );

    } finally {
        removeTypingIndicator();

        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        userInput.focus();
    }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

newChatBtn.addEventListener("click", startNewChat);

// Load history on startup
loadChatHistory();
