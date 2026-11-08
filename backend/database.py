
import sqlite3

DATABASE_NAME = "chatbot.db"


def get_connection():
    return sqlite3.connect(DATABASE_NAME)


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            conversation_id TEXT PRIMARY KEY,
            title TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT,
            role TEXT,
            content TEXT,
            FOREIGN KEY (conversation_id)
                REFERENCES conversations(conversation_id)
        )
    """)

    connection.commit()
    connection.close()


def save_conversation(conversation_id, title):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT OR IGNORE INTO conversations (conversation_id, title) VALUES (?, ?)",
        (conversation_id, title)
    )

    connection.commit()
    connection.close()


def save_message(conversation_id, role, content):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO messages (conversation_id, role, content)
        VALUES (?, ?, ?)
        """,
        (conversation_id, role, content)
    )

    connection.commit()
    connection.close()


def get_conversation_history(conversation_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT role, content
        FROM messages
        WHERE conversation_id = ?
        ORDER BY id
        """,
        (conversation_id,)
    )

    rows = cursor.fetchall()
    connection.close()

    return [
        {"role": role, "content": content}
        for role, content in rows
    ]


def get_all_conversations():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT conversation_id, title FROM conversations ORDER BY rowid DESC"
    )

    rows = cursor.fetchall()
    connection.close()

    return [
        {"conversation_id": conversation_id, "title": title}
        for conversation_id, title in rows
    ]
# Rename a conversation
def rename_conversation(conversation_id, new_title):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE conversations
        SET title = ?
        WHERE conversation_id = ?
        """,
        (new_title, conversation_id)
    )

    connection.commit()
    updated = cursor.rowcount > 0
    connection.close()

    return updated


# Delete a conversation and its messages
def delete_conversation(conversation_id):
    connection = get_connection()
    cursor = connection.cursor()

    # Delete all messages belonging to this conversation
    cursor.execute(
        "DELETE FROM messages WHERE conversation_id = ?",
        (conversation_id,)
    )

    # Delete the conversation itself
    cursor.execute(
        "DELETE FROM conversations WHERE conversation_id = ?",
        (conversation_id,)
    )

    deleted = cursor.rowcount > 0

    connection.commit()
    connection.close()

    return deleted