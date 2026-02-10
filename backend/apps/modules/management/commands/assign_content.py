from django.core.management.base import BaseCommand
from apps.authapp.models import User
from apps.modules.models import Module, ModuleProgress
from apps.assignments.models import Assignment, Submission
from apps.quiz.models import Quiz, QuizAttempt
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Assigns content to a specific learner'

    def handle(self, *args, **kwargs):
        username = 'nimmu'
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} not found'))
            return

        self.stdout.write(f'Processing assignments for {user.username}...')

        modules = Module.objects.all()
        for module in modules:
            # 1. Create Module Progress
            status_choice = random.choice(['not_started', 'in_progress', 'completed'])
            progress, created = ModuleProgress.objects.get_or_create(
                user=user, 
                module=module,
                defaults={'status': 'not_started'}
            )
            
            if created or progress.status == 'not_started':
                progress.status = status_choice
                progress.save()
                self.stdout.write(f'Updated progress for {module.title}: {status_choice}')

            # 2. Assign Assignments
            if module.has_assignment:
                assignment, assign_created = Assignment.objects.get_or_create(
                    user=user,
                    module=module,
                    defaults={
                        'status': 'pending', 
                        'assigned_by': User.objects.filter(is_superuser=True).first()
                    }
                )
                if assign_created:
                    self.stdout.write(f'Assigned: {module.title}')

                # Randomly complete some assignments
                if random.random() > 0.6:
                    assignment.status = 'completed'
                    assignment.completed_at = timezone.now()
                    assignment.save()
                    Submission.objects.get_or_create(
                        assignment=assignment,
                        defaults={
                            'content': 'Check out my cool project implementation.',
                            'status': 'graded',
                            'grade': random.randint(80, 100)
                        }
                    )

            # 3. Create Quiz Attempts
            if module.has_quiz:
                quiz = Quiz.objects.filter(module=module).first()
                if quiz:
                    # Randomly take privacy
                    if random.random() > 0.5:
                        score = random.randint(60, 100)
                        passed = score >= quiz.passing_score
                        QuizAttempt.objects.create(
                            user=user,
                            quiz=quiz,
                            score=score,
                            passed=passed
                        )
                        self.stdout.write(f'Quiz attempt created for {quiz.title}: {score}%')

        self.stdout.write(self.style.SUCCESS(f'Successfully engaged learner {username} with content'))
