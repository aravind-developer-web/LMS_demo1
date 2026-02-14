"""
Sync database schema with Django models
"""
import sqlite3

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List of columns to add
columns_to_add = [
    ("assignment_prompt", "TEXT DEFAULT ''"),
    ("has_assignment", "BOOLEAN DEFAULT 0"),
    ("has_quiz", "BOOLEAN DEFAULT 0"),
    ("priority", "INTEGER DEFAULT 0"),
]

print("Syncing modules_module table...")

for column_name, column_type in columns_to_add:
    try:
        cursor.execute(f"SELECT {column_name} FROM modules_module LIMIT 1")
        print(f"  [EXISTS] {column_name}")
    except sqlite3.OperationalError:

        print(f"  [ADDING] {column_name}...")
        cursor.execute(f"ALTER TABLE modules_module ADD COLUMN {column_name} {column_type}")
        print(f"  [OK] Added {column_name}")

conn.commit()
conn.close()

print("\n[OK] Database schema synced!")
