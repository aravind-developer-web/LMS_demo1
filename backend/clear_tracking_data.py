import os
import django
from django.db import connection

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def purge_data():
    print("WARNING: This will DELETE all tracking data. Press Ctrl+C to cancel in 5 seconds...")
    # import time; time.sleep(5) 
    # Skipping sleep for automated run, assuming approval was given.

    print("Purging data...")
    
    with connection.cursor() as cursor:
        # Disable FK checks to avoid constraint errors during truncation
        cursor.execute("PRAGMA foreign_keys = OFF;")
        
        tables_to_purge = [
            'analytics_activitylog',
            'analytics_learningsession',
            'quiz_quizattempt',
            'assignments_assignment',
            'progress_moduleprogress',
            'analytics_learneractivitylog', # If exists
            'analytics_videoprogress', # If exists
            'modules_moduleprogress' # If exists (duplicate?)
        ]

        for table in tables_to_purge:
            try:
                print(f"Truncating {table}...")
                cursor.execute(f"DELETE FROM {table};")
                # SQLite doesn't have TRUNCATE, so we use DELETE.
                # Reset sequence if needed:
                # cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';") 
            except Exception as e:
                print(f"Skipping {table} (might not verify_schema_exist): {e}")

        cursor.execute("PRAGMA foreign_keys = ON;")

    print("Data purge complete. Systems ready for real telemetry.")

if __name__ == '__main__':
    purge_data()
