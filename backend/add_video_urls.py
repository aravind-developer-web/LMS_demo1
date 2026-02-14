"""
Add video_url column to modules_module table and populate with sample videos
"""
import sqlite3
import os

# Database path
db_path = 'db.sqlite3'

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column exists
try:
    cursor.execute("SELECT video_url FROM modules_module LIMIT 1")
    print("[OK] video_url column already exists!")
except sqlite3.OperationalError:
    # Column doesn't exist, add it
    print("Adding video_url column...")
    cursor.execute("ALTER TABLE modules_module ADD COLUMN video_url VARCHAR(500)")
    conn.commit()
    print("[OK] video_url column added successfully!")

# Sample YouTube video URLs for educational content
sample_videos = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Sample video 1
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",  # Sample video 2  
    "https://www.youtube.com/watch?v=9bZkp7q19f0",  # Sample video 3
]

# Update modules with sample video URLs
cursor.execute("SELECT id, title FROM modules_module WHERE video_url IS NULL OR video_url = '' LIMIT 10")
modules = cursor.fetchall()

print(f"\nUpdating {len(modules)} modules with sample video URLs...")

for i, (module_id, title) in enumerate(modules):
    video_url = sample_videos[i % len(sample_videos)]
    cursor.execute("UPDATE modules_module SET video_url = ? WHERE id = ?", (video_url, module_id))
    print(f"  - Module {module_id} ({title}): {video_url}")

conn.commit()
conn.close()

print("\n[OK] All done! Modules now have video URLs.")
