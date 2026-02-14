"""
Simulate learner activity to populate analytics
"""
import os
import django
import random
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module
from apps.analytics.models import VideoProgress, LearningSession

User = get_user_model()

def simulate_activity():
    try:
        user = User.objects.get(username='muntaj')
        print(f"Simulating activity for: {user.username}")
    except User.DoesNotExist:
        print("User 'muntaj' not found. Creating...")
        user = User.objects.create_user(username='muntaj', email='muntaj@gmail.com', password='password123', role='learner')

    modules = Module.objects.all()[:5]
    
    print("\n1. Simulating Video Progress...")
    for i, module in enumerate(modules):
        # Determine fake progress
        if i == 0: progress = 100.0 # Completed
        elif i == 1: progress = 75.5 # In Progress
        elif i == 2: progress = 10.0 # Just Started
        else: progress = 0.0
        
        if progress > 0:
            # Fake video ID (normally from YouTube URL)
            video_id = f"video_{module.id}"
            
            VideoProgress.objects.update_or_create(
                user=user,
                module=module,
                video_id=video_id,
                defaults={
                    'watched_seconds': progress * 6, # assume 10 min video = 600s
                    'total_seconds': 600,
                    'completion_percent': progress
                }
            )
            print(f"  - Module {module.id}: {progress}% watched")

    print("\n2. Simulating Learning Sessions...")
    for i, module in enumerate(modules):
        if i < 3:
            # Active sessions
            session_time = random.randint(300, 3600) # 5m to 1h
            LearningSession.objects.create(
                user=user,
                module=module,
                total_seconds=session_time,
                status='completed'
            )
            print(f"  - Session for Module {module.id}: {session_time}s")

    print("\n[DONE] Simulation complete.")
    
if __name__ == '__main__':
    simulate_activity()
