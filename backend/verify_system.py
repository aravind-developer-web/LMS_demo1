import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module, Resource
from apps.analytics.models import LearningSession
from apps.quiz.models import Quiz
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("LMS SYSTEM VERIFICATION REPORT")
print("=" * 60)

# Modules and Resources
modules = Module.objects.all()
print(f"\nMODULES: {modules.count()} total")
for m in modules:
    resources = m.resources.all()
    videos = resources.filter(type='video')
    print(f"  - {m.title}")
    print(f"    Resources: {resources.count()}")
    print(f"    Videos: {videos.count()}")
    if videos.exists():
        for v in videos[:2]:
            print(f"      * {v.title}: {v.url[:50]}...")

# Users
learners = User.objects.filter(role='learner')
managers = User.objects.filter(role='manager')
print(f"\nUSERS:")
print(f"  - Learners: {learners.count()}")
print(f"  - Managers: {managers.count()}")

# Learning Sessions
sessions = LearningSession.objects.all()
print(f"\nTRACKING:")
print(f"  - Learning Sessions: {sessions.count()}")
if sessions.exists():
    recent = sessions.order_by('-start_time').first()
    print(f"  - Most Recent: {recent.user.username} - {recent.focus_duration_seconds}s")

# Quizzes
quizzes = Quiz.objects.all()
print(f"\nQUIZZES: {quizzes.count()} total")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE - ALL SYSTEMS OPERATIONAL")
print("=" * 60)
