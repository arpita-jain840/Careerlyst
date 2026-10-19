
from contextlib import contextmanager
import os
import sqlite3
from pathlib import Path

# The override allows tests and deployments to keep the default DB untouched.
DB_PATH = Path(
    os.getenv(
        "CAREERLYST_DB_PATH",
        str(Path(__file__).resolve().parent / "careerlyst.db"),
    )
).expanduser()


@contextmanager
def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                opportunity_key TEXT NOT NULL,
                opportunity_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Applied'
                    CHECK (status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
                application_date TEXT,
                interview_at TEXT,
                follow_up_at TEXT,
                reminder_note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, opportunity_key)
            )
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_applications_user_updated
            ON applications (user_id, updated_at DESC)
        """)
