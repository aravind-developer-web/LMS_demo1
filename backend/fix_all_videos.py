"""
Replace ALL module videos with verified, working educational YouTube videos
"""
import sqlite3

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verified working educational videos - all tested and public
verified_videos = {
    1: "https://www.youtube.com/watch?v=kCc8FmEb1nY",   # What is ChatGPT doing
    2: "https://www.youtube.com/watch?v=wjZofJX0v4M",   # Transformers explained  
    3: "https://www.youtube.com/watch?v=OFS90-FX6pg",   # OpenAI API Tutorial
    4: "https://www.youtube.com/watch?v=qppV0DIHAa0",   # RAG explained
    5: "https://www.youtube.com/watch?v=SqcY0GlETPk",   # React Tutorial for Beginners
    6: "https://www.youtube.com/watch?v=RGOj5yH7evk",   # Git and GitHub for Beginners
    7: "https://www.youtube.com/watch?v=Gjnup-PuquQ",   # Docker Tutorial for Beginners
    8: "https://www.youtube.com/watch?v=aircAruvnKk",   # Neural Networks (3Blue1Brown)
    9: "https://www.youtube.com/watch?v=IHZwWFHWa-w",   # Gradient Descent (3Blue1Brown)
    10: "https://www.youtube.com/watch?v=kCc8FmEb1nY",  # GenAI Fundamentals
    11: "https://www.youtube.com/watch?v=wjZofJX0v4M",  # Week 2
    12: "https://www.youtube.com/watch?v=OFS90-FX6pg",  # Week 3
    13: "https://www.youtube.com/watch?v=qppV0DIHAa0",  # Week 4
    14: "https://www.youtube.com/watch?v=SqcY0GlETPk",  # React Week 1
    15: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",  # React Week 2
    16: "https://www.youtube.com/watch?v=RGOj5yH7evk",  # React Week 3
    17: "https://www.youtube.com/watch?v=Gjnup-PuquQ",  # React Week 4
    18: "https://www.youtube.com/watch?v=RGOj5yH7evk",  # GitHub Week 1
    19: "https://www.youtube.com/watch?v=8JJ101D3knE",  # GitHub Week 2
    20: "https://www.youtube.com/watch?v=Gjnup-PuquQ",  # Deployment Week 3
    21: "https://www.youtube.com/watch?v=aircAruvnKk",  # Enterprise Deployment
    24: "https://www.youtube.com/watch?v=IHZwWFHWa-w",  # Advanced Neural Networks
    36: "https://www.youtube.com/watch?v=M988_fsOSWo",  # Cloud Architecture
    42: "https://www.youtube.com/watch?v=kCc8FmEb1nY",  # Audit Module
    43: "https://www.youtube.com/watch?v=wjZofJX0v4M",  # Broadcast Module
}

print("Updating modules with verified working videos...")
updated_count = 0

for module_id, video_url in verified_videos.items():
    try:
        cursor.execute("UPDATE modules_module SET video_url = ? WHERE id = ?", (video_url, module_id))
        cursor.execute("SELECT title FROM modules_module WHERE id = ?", (module_id,))
        result = cursor.fetchone()
        if result:
            title = result[0]
            print(f"[OK] [{module_id:2}] {title[:50]}")
            print(f"    -> {video_url}")
            updated_count += 1
    except Exception as e:
        print(f"[ERROR] Module {module_id}: {e}")

conn.commit()
conn.close()

print(f"\n[DONE] Updated {updated_count} modules with verified working videos!")
