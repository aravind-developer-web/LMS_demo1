"""
Create sample assignments for testing
"""
import sqlite3
from datetime import datetime, timedelta

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get a learner user (not manager)
cursor.execute("SELECT id, username, role FROM authapp_user WHERE role = 'learner' LIMIT 1")
learner = cursor.fetchone()

if not learner:
    print("No learner users found! Creating assignments failed.")
    conn.close()
    exit(1)

learner_id, learner_username, learner_role = learner
print(f"Creating assignments for: {learner_username} (ID: {learner_id})")

# Get some modules to assign
cursor.execute("SELECT id, title FROM modules_module WHERE has_assignment = 1 LIMIT 5")
modules = cursor.fetchall()

if not modules:
    print("\nNo modules with assignments found! Checking all modules...")
    cursor.execute("SELECT id, title FROM modules_module LIMIT 5")
    modules = cursor.fetchall()

print(f"\nCreating {len(modules)} test assignments...\n")

due_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
assigned_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

for i, (module_id, module_title) in enumerate(modules):
    try:
        # Check if assignment already exists
        cursor.execute(
            "SELECT id FROM assignments_assignment WHERE user_id = ? AND module_id = ?",
            (learner_id, module_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            print(f"  [SKIP] Assignment already exists for Module {module_id}")
            continue
        
        # Create assignment
        status = 'pending' if i < 3 else 'in_progress'
        cursor.execute("""
            INSERT INTO assignments_assignment 
            (user_id, module_id, status, due_date, assigned_at, content, submitted_at, completed_at, assigned_by_id)
            VALUES (?, ?, ?, ?, ?, '', NULL, NULL, NULL)
        """, (learner_id, module_id, status, due_date, assigned_at))
        
        print(f"  [OK] {module_title}")
        print(f"       Status: {status} | Due: {due_date.split()[0]}")
        
    except Exception as e:
        print(f"  [ERROR] Module {module_id}: {e}")

conn.commit()

# Count total assignments
cursor.execute("SELECT COUNT(*) FROM assignments_assignment WHERE user_id = ?", (learner_id,))
total = cursor.fetchone()[0]

conn.close()

print(f"\n[DONE] {learner_username} now has {total} assignments!")
print("\nRefresh http://localhost:3000/assignments to see them!")
