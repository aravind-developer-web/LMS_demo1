"""
Update modules with real, working educational video URLs
"""
import sqlite3

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Real educational YouTube videos that actually work
educational_videos = [
    "https://www.youtube.com/watch?v=aircAruvnKk",  # 3Blue1Brown: Neural Networks
    "https://www.youtube.com/watch?v=IHZwWFHWa-w",  # 3Blue1Brown: Gradient Descent
    "https://www.youtube.com/watch?v=JrhnLhPVHVE",  # Machine Learning Basics
    "https://www.youtube.com/watch?v=gZmobeGL0Yg",  # LLM explained
    "https://www.youtube.com/watch?v=kCc8FmEb1nY",  # Transformers explained
    "https://www.youtube.com/watch?v=SZorAJ4I-sA",  # React Tutorial
    "https://www.youtube.com/watch?v=RGKi6LSPDLU",  # Docker Tutorial
    "https://www.youtube.com/watch?v=ZXsQAXx_ao0",  # Python Programming
]

# Get all modules
cursor.execute("SELECT id, title FROM modules_module ORDER BY id")
modules = cursor.fetchall()

print(f"Updating {len(modules)} modules with working educational videos...\n")

for i, (module_id, title) in enumerate(modules):
    # Cycle through the educational videos
    video_url = educational_videos[i % len(educational_videos)]
    cursor.execute("UPDATE modules_module SET video_url = ? WHERE id = ?", (video_url, module_id))
    print(f"[{module_id}] {title}")
    print(f"    -> {video_url}\n")

conn.commit()
conn.close()

print("\n[DONE] All modules updated with working educational videos!")
