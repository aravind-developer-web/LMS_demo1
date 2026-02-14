
import sqlite3
import os

DB_PATH = 'db.sqlite3'

def nuke_analytics_tables():
    if not os.path.exists(DB_PATH):
        print("Database not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tables = [
        'analytics_videoprogress',
        'analytics_learningsession',
        'analytics_activitylog',
        'django_migrations' # We need to be careful with this, but let's delete analytics rows from it
    ]

    print("Dropping analytics tables...")
    for table in tables[:3]: # Drop only the analytics tables
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")

    # clean mutation history for analytics
    print("Cleaning migration history...")
    cursor.execute("DELETE FROM django_migrations WHERE app='analytics'")
    print(f"Deleted {cursor.rowcount} analytics migration records.")

    conn.commit()
    conn.close()
    print("Nuke complete.")

if __name__ == "__main__":
    nuke_analytics_tables()
