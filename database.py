import sqlite3

DB_NAME = "chatbot.db"


def get_connection():
    """Create and return a SQLite database connection."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    """Create database tables."""

    conn = get_connection()
    cursor = conn.cursor()

    # Chats table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(chat_id) REFERENCES chats(id)
        )
    """)

    conn.commit()
    conn.close()


def save_message(role, content):
    """Save a chat message to the database."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO messages (role, content)
        VALUES (?, ?)
    """, (role, content))

    conn.commit()
    conn.close()


def get_chat_history():
    """Return all messages ordered by insertion."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, role, content, created_at
        FROM messages
        ORDER BY id ASC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def clear_chat():
    """Delete all chat messages."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM messages")

    # Reset auto-increment counter (optional)
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='messages'")

    conn.commit()
    conn.close()


def delete_message(message_id):
    """Delete a single message by ID."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM messages
        WHERE id = ?
    """, (message_id,))

    conn.commit()
    conn.close()


def get_message(message_id):
    """Return a single message."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM messages
        WHERE id = ?
    """, (message_id,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


if __name__ == "__main__":
    create_tables()
    print("✅ Database initialized successfully.")