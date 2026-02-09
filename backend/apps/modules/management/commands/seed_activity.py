from django.core.management.base import BaseCommand
from apps.modules.models import Module, ModuleProgress, Resource, ResourceProgress
from apps.quiz.models import Quiz, QuizAttempt
from apps.assignments.models import Assignment, Submission
from apps.authapp.models import User
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Seeds learner activity to populate Manager Dashboard analytics'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding Neural Activity...')

        learners = User.objects.filter(role='learner')
        if not learners.exists():
            self.stdout.write(self.style.WARNING('No learners found. Seeding skipped.'))
            return

        modules = Module.objects.all()
        
        for learner in learners:
            self.stdout.write(f"Simulating activity for {learner.username}...")
            
            for module in modules:
                # 1. Simulate Module Progress
                # Randomize status: 70% completed, 20% in-progress, 10% not-started
                rand = random.random()
                if rand < 0.7:
                    status = 'completed'
                    completed_at = timezone.now() - timedelta(days=random.randint(0, 7))
                    started_at = completed_at - timedelta(hours=random.randint(1, 48))
                elif rand < 0.9:
                    status = 'in_progress'
                    completed_at = None
                    started_at = timezone.now() - timedelta(days=random.randint(0, 3))
                else:
                    status = 'not_started'
                    completed_at = None
                    started_at = timezone.now()

                ModuleProgress.objects.update_or_create(
                    user=learner,
                    module=module,
                    defaults={
                        "status": status,
                        "started_at": started_at,
                        "completed_at": completed_at,
                        "last_accessed": timezone.now()
                    }
                )

                # 2. Simulate Resource Progress (Video Watch Time)
                resources = module.resources.filter(type='video')
                for res in resources:
                    if status == 'completed' or (status == 'in_progress' and random.random() > 0.3):
                        ResourceProgress.objects.update_or_create(
                            user=learner,
                            resource=res,
                            defaults={
                                "completed": True,
                                "watch_time_seconds": random.randint(300, 1800), # 5-30 mins
                                "last_position_seconds": 0,
                                "completed_at": timezone.now()
                            }
                        )

                # 3. Simulate Quiz Attempts
                if hasattr(module, 'quiz'):
                    if status == 'completed' or (status == 'in_progress' and random.random() > 0.5):
                        score = random.randint(60, 100)
                        passed = score >= module.quiz.passing_score
                        QuizAttempt.objects.create(
                            user=learner,
                            quiz=module.quiz,
                            score=score,
                            passed=passed,
                            timestamp=timezone.now() - timedelta(days=random.randint(0, 5))
                        )

                # 4. Simulate Assignment Submissions
                if hasattr(module, 'assignments') and module.has_assignment: 
                    # Create the Assignment tracking record (Mocking logic)
                    assignment, created = Assignment.objects.get_or_create(
                        user=learner,
                        module=module,
                        defaults={
                            'status': 'pending',
                            'due_date': timezone.now() + timedelta(days=7)
                        }
                    )
                    
                    if status == 'completed' or (status == 'in_progress' and random.random() > 0.6):
                        assignment.status = 'completed'
                        assignment.completed_at = timezone.now() - timedelta(days=random.randint(1, 3))
                        assignment.save()

                        # Create the Submission
                        Submission.objects.create(
                            assignment=assignment,
                            content=f"Strategic analysis of {module.title} completed. Key findings include optimal node deployment and lattice structure integrity.",
                            status='pending' if random.random() > 0.5 else 'graded',
                            submitted_at=assignment.completed_at,
                            grade=random.randint(80, 100) if random.random() > 0.5 else None
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded learner activity.'))
