"""
Simulate learner activity for NAVEEN
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

def simulate_naveen():
    try:
        user = User.objects.get(username='naveen')
        print(f"Simulating activity for: {user.username} (ID: {user.id})")
    except User.DoesNotExist:
        print("User 'naveen' not found.")
        return

    modules = Module.objects.all()[:3]
    
    print("\n1. Simulating Video Progress...")
    for i, module in enumerate(modules):
        # Module 1: 50%
        # Module 2: 25%
        if i == 0: progress = 50.0 
        elif i == 1: progress = 25.0
        else: progress = 0.0
        
        if progress > 0:
            video_id = f"video_{module.id}"
            VideoProgress.objects.update_or_create(
                user=user,
                module=module,
                video_id=video_id,
                defaults={
                    'watched_seconds': progress * 6, 
                    'total_seconds': 600,
                    'completion_percent': progress
                }
            )
            print(f"  - Module {module.id}: {progress}% watched")

    print("\n2. Simulating Learning Sessions...")
    for i, module in enumerate(modules):
        if i < 2:
            session_time = random.randint(100, 500)
            LearningSession.objects.create(
                user=user,
                module=module,
                total_seconds=session_time,
                status='active'
            )
            print(f"  - Session for Module {module.id}: {session_time}s")

    print("\n[DONE] Simulation complete for Naveen.")
    
if __name__ == '__main__':
    simulate_naveen()
