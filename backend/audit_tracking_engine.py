import os
import django
import sys
import time

# Setup Django Environment
# Add the current directory (backend/) to sys.path so we can import config
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module
from apps.analytics.models import VideoProgress, LearningSession
from apps.quiz.models import QuizAttempt, Quiz
from apps.assignments.models import Assignment
from django.db.models import Avg

User = get_user_model()

def run_audit():
    print("\nSTARTING FINAL AUDIT SIMULATION: 'Perfect Learner' Flow")
    print("="*60)

    # 1. Create Test User
    username = f"perfect_learner_{int(time.time())}"
    user = User.objects.create_user(username=username, password="password123", role='learner')
    print(f"User Created: {username}")

    # 2. Get a Target Module
    module = Module.objects.first()
    if not module:
        print("CRITICAL: No modules found in DB. Cannot test.")
        return
    print(f"Target Module: {module.title} (ID: {module.id})")

    # 3. Simulate 100% Video Watch
    VideoProgress.objects.create(
        user=user,
        module=module,
        video_id='test_vid',
        watched_seconds=300,
        total_seconds=300,
        completion_percent=100.0
    )
    print("Video Progress: Simulating 100% watched.")

    # 4. Simulate 100% Quiz Score
    quiz = Quiz.objects.filter(module=module).first()
    if not quiz:
        quiz = Quiz.objects.create(module=module, title="Audit Quiz")
    
    QuizAttempt.objects.create(
        user=user,
        quiz=quiz,
        score=100.0
    )
    print("Quiz Progress: Simulating 100% score.")

    # 5. Simulate Assignment Completion
    module.has_assignment = True
    module.save()
    
    Assignment.objects.create(
        user=user,
        module=module,
        content="Perfect work",
        status='completed'
    )
    print("Assignment: Simulating 'completed' status.")

    # 6. Simulate Active Session (Time Invested)
    LearningSession.objects.create(
        user=user,
        module=module,
        total_seconds=3600, # 1 hour
        status='active'
    )
    print("One Hour Session Logged.")

    # 7. RUN THE AUDIT (Replicate View Logic)
    print("\nCALCULATING AGGREGATE SCORE...")
    
    # Video Avg
    video_avg = VideoProgress.objects.filter(user=user).aggregate(avg=Avg('completion_percent'))['avg'] or 0.0
    
    # Quiz Avg
    quiz_avg = QuizAttempt.objects.filter(user=user).aggregate(avg=Avg('score'))['avg'] or 0.0
    
    # Assignment Avg
    modules_with_assignments = Module.objects.filter(has_assignment=True).count()
    completed_assignments = Assignment.objects.filter(user=user, status='completed').count()
    
    if modules_with_assignments == 0:
        assignment_avg = 100.0 if completed_assignments > 0 else 0.0
    else:
        assignment_avg = (completed_assignments / modules_with_assignments) * 100
    
    print(f"   > Video Avg: {video_avg}%")
    print(f"   > Quiz Avg: {quiz_avg}%")
    print(f"   > Assignment Avg: {assignment_avg}% (Completed {completed_assignments}/{modules_with_assignments})")

    overall = (0.4 * video_avg) + (0.3 * quiz_avg) + (0.3 * assignment_avg)
    overall = min(100.0, max(0.0, overall))
    
    print(f"\nFINAL CALCULATED SCORE: {overall}%")
    
    if overall > 90:
        print("RATING: EXCELLENT (Tracking Engine is Accurate)")
    elif overall > 50:
        print("RATING: GOOD (Check Assignment Denominator - likely global modules vs user completed)")
    else:
        print("RATING: FAILED (Tracking Logic is Broken)")

if __name__ == "__main__":
    run_audit()
