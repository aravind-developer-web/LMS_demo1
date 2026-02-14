"""
Add missing content and submitted_at columns to assignments_assignment table
"""
import sqlite3

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check and add columns
columns_to_add = [
    ("content", "TEXT DEFAULT ''"),
    ("submitted_at", "datetime"),
]

print("Syncing assignments_assignment table...")

for column_name, column_type in columns_to_add:
    try:
        cursor.execute(f"SELECT {column_name} FROM assignments_assignment LIMIT 1")
        print(f"  [EXISTS] {column_name}")
    except sqlite3.OperationalError:
        print(f"  [ADDING] {column_name}...")
        cursor.execute(f"ALTER TABLE assignments_assignment ADD COLUMN {column_name} {column_type}")
        print(f"  [OK] Added {column_name}")

conn.commit()
conn.close()

print("\n[DONE] Assignment table synced!")
