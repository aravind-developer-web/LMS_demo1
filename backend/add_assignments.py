"""
Create 5 test assignments for the muntaj user
"""
import sqlite3
from datetime import datetime, timedelta

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find the muntaj user (visible in screenshot)
cursor.execute("SELECT id, username, role FROM authapp_user WHERE username = 'muntaj'")
user = cursor.fetchone()

if not user:
    print("User 'muntaj' not found! Trying any learner user...")
    cursor.execute("SELECT id, username, role FROM authapp_user WHERE role = 'learner' LIMIT 1")
    user = cursor.fetchone()
    
if not user:
    print("ERROR: No learner users found!")
    conn.close()
    exit(1)

user_id, username, role = user
print(f"Adding assignments for: {username} (ID: {user_id})")

# Get 5 modules
cursor.execute("SELECT id, title FROM modules_module ORDER BY id LIMIT 5")
modules = cursor.fetchall()

print(f"\nCreating {len(modules)} assignments...\n")

due_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
assigned_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

created = 0
for i, (module_id, module_title) in enumerate(modules):
    try:
        # Delete existing assignment if present
        cursor.execute(
            "DELETE FROM assignments_assignment WHERE user_id = ? AND module_id = ?",
            (user_id, module_id)
        )
        
        # Create new assignment
        status = 'pending' if i < 3 else 'in_progress'
        cursor.execute("""
            INSERT INTO assignments_assignment 
            (user_id, module_id, status, due_date, assigned_at, content, submitted_at, completed_at, assigned_by_id)
            VALUES (?, ?, ?, ?, ?, '', NULL, NULL, NULL)
        """, (user_id, module_id, status, due_date, assigned_at))
        
        print(f"[{i+1}] {module_title}")
        print(f"    Status: {status} | Due: {due_date.split()[0]}\n")
        created += 1
        
    except Exception as e:
        print(f"ERROR: {e}")

conn.commit()

# Verify
cursor.execute("SELECT COUNT(*) FROM assignments_assignment WHERE user_id = ?", (user_id,))
total = cursor.fetchone()[0]

conn.close()

print(f"="*60)
print(f"SUCCESS: {username} now has {total} assignments!")
print(f"Refresh http://localhost:3000/assignments")
print(f"="*60)
