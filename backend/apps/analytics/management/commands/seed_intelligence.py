from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.modules.models import Module, ModuleProgress, Resource, ResourceProgress
from apps.quiz.models import Quiz, QuizAttempt, Question, Answer
from apps.assignments.models import Assignment, Submission
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds learner patterns for Intelligence Engine'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Seeding Intelligence Data..."))
        
        # 1. Ensure Modules Exist
        module, _ = Module.objects.get_or_create(
            title="Advanced Neural Networks", 
            defaults={
                "description": "Deep Learning Fundamentals",
                "duration": 600
            }
        )
        
        # 2. Create Personas
        personas = [
            {"username": "learner_struggling", "state": "Struggling"},
            {"username": "learner_passive", "state": "Passive"},
            {"username": "learner_skilled", "state": "Skilled"},
            {"username": "learner_risk", "state": "Risk"},
            {"username": "learner_active", "state": "Active"},
        ]

        for p in personas:
            user, created = User.objects.get_or_create(username=p['username'], email=f"{p['username']}@example.com", role='learner')
            if created:
                user.set_password('password123')
                user.save()
            
            # Reset Progress
            ModuleProgress.objects.filter(user=user).delete()
            ResourceProgress.objects.filter(user=user).delete()
            QuizAttempt.objects.filter(user=user).delete()
            Submission.objects.filter(assignment__user=user).delete()

            # Initialize Module Progress
            mp = ModuleProgress.objects.create(user=user, module=module, started_at=timezone.now()-timedelta(days=10), last_accessed=timezone.now())

            # Specific Behavior Seeding
            if p['state'] == "Struggling":
                # Fails quizzes multiple times
                quiz, _ = Quiz.objects.get_or_create(module=module, title="Neural Basics Quiz")
                for i in range(3):
                    QuizAttempt.objects.create(user=user, quiz=quiz, score=40, passed=False, timestamp=timezone.now()-timedelta(days=3-i))
            
            elif p['state'] == "Passive":
                # Watches everything, does nothing
                resources = [Resource.objects.create(module=module, title=f"Video {i}", type="video") for i in range(3)]
                for r in resources:
                    ResourceProgress.objects.create(user=user, resource=r, completed=True, watch_time_seconds=600, completed_at=timezone.now())
            
            elif p['state'] == "Skilled":
                # High scores, assignment submitted
                quiz, _ = Quiz.objects.get_or_create(module=module, title="Neural Basics Quiz")
                QuizAttempt.objects.create(user=user, quiz=quiz, score=95, passed=True, timestamp=timezone.now())
                
                assign, _ = Assignment.objects.get_or_create(module=module, user=user)
                Submission.objects.create(assignment=assign, content="Solution...", status='graded', grade=98, submitted_at=timezone.now())
            
            elif p['state'] == "Risk":
                # Inactive for 20 days
                mp.last_accessed = timezone.now() - timedelta(days=20)
                mp.save()
            
            elif p['state'] == "Active":
                # Normal progress
                quiz, _ = Quiz.objects.get_or_create(module=module, title="Neural Basics Quiz")
                QuizAttempt.objects.create(user=user, quiz=quiz, score=75, passed=False, timestamp=timezone.now()-timedelta(days=1))
                ResourceProgress.objects.create(user=user, resource=Resource.objects.first(), completed=True, watch_time_seconds=300)

        self.stdout.write(self.style.SUCCESS("Intelligence Data Seeded Successfully!"))
