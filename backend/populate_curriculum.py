import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module, Resource
from apps.quiz.models import Quiz, Question, Answer
from apps.assignments.models import Assignment
from django.contrib.auth import get_user_model

User = get_user_model()

def populate():
    print("Starting curriculum population...")
    learners = User.objects.filter(role='learner')
    manager = User.objects.filter(role='manager').first() or User.objects.filter(is_staff=True).first()

    for week_num in range(1, 5):
        for module_index in range(1, 6):
            title = f"Module {week_num}.{module_index}: "
            if week_num == 1: title += "Core Synchronization"
            elif week_num == 2: title += "Neural Architecture"
            elif week_num == 3: title += "Quantum Sovereignty"
            else: title += "Global Governance"

            module, created = Module.objects.get_or_create(
                week=week_num,
                title=title,
                defaults={
                    'description': f"Granular learning protocol for Week {week_num}, Phase {module_index}.",
                    'duration': 30,
                    'difficulty': 'beginner' if week_num == 1 else 'intermediate'
                }
            )
            
            # 1. Resource
            Resource.objects.get_or_create(
                module=module,
                title=f"Protocol Video {week_num}.{module_index}",
                defaults={
                    'description': "High-fidelity video training.",
                    'type': 'video',
                    'url': "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    'order': 1
                }
            )

            # 2. Quiz
            quiz, q_created = Quiz.objects.get_or_create(
                module=module,
                title=f"Validation Quiz {week_num}.{module_index}",
                defaults={'passing_score': 80}
            )
            if q_created:
                for j in range(1, 3):
                    question = Question.objects.create(quiz=quiz, text=f"Knowledge Query {j} for {module.title}")
                    Answer.objects.create(question=question, text="Verified Correct", is_correct=True)
                    Answer.objects.create(question=question, text="Anomalous Data", is_correct=False)

            # 3. Assignment
            for learner in learners:
                Assignment.objects.get_or_create(
                    user=learner,
                    module=module,
                    defaults={
                        'assigned_by': manager,
                        'status': 'pending'
                    }
                )

    print("Population complete.")

    print("Population complete.")

if __name__ == "__main__":
    populate()
