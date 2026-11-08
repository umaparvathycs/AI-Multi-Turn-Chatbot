# AI Multi-Turn Conversational Chatbot

An AI-powered chatbot that supports natural, multi-turn conversations using Google Gemini. It stores conversation history, allowing users to revisit, rename, and delete previous chats.

## Features

- AI-powered responses using Google Gemini
- Multi-turn conversational memory
- Persistent conversation storage using SQLite
- Create new conversations
- View and reopen previous conversations
- Rename conversations
- Delete conversations
- Typing indicator for better user experience
- Responsive web-based interface

## Technologies Used

- **Backend:** Python, FastAPI
- **AI Model:** Google Gemini
- **Database:** SQLite
- **Frontend:** HTML, CSS, JavaScript
- **Version Control:** Git and GitHub

## Project Structure

```text
AI-Multi-Turn-Chatbot/
├── backend/
│   ├── chatbot.py
│   ├── config.py
│   ├── database.py
│   └── main.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env
├── .gitignore
└── requirements.txt
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/umaparvathycs/AI-Multi-Turn-Chatbot.git
cd AI-Multi-Turn-Chatbot
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure the Gemini API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

Replace the placeholder with your own Gemini API key. Never upload your actual API key to GitHub.

### 6. Run the backend

```bash
uvicorn backend.main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 7. Run the frontend

Open the `frontend` folder in VS Code and launch `index.html` using Live Server.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome message |
| POST | `/chat` | Send a message |
| GET | `/conversations` | List conversations |
| GET | `/conversations/{id}` | Retrieve conversation |
| PUT | `/conversations/{id}` | Rename conversation |
| DELETE | `/conversations/{id}` | Delete conversation |

## Future Improvements

- User authentication
- Deploy the application online
- Cloud database integration
- Improved chat interface
- Support for additional AI models

## Author

**DIGITAL NODES**
