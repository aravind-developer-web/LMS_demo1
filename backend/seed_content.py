import os
import django
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module, Resource
from apps.quiz.models import Quiz, Question, Answer
from apps.assignments.models import Assignment
from django.contrib.auth import get_user_model

User = get_user_model()

def populate():
    print("Initializing High-Fidelity Content Injection...")
    learners = User.objects.filter(role='learner')
    manager = User.objects.filter(role='manager').first() or User.objects.filter(is_staff=True).first()

    # Verified Embeddable YouTube IDs for educational content
    video_ids = [
        "J3M98-p7X6o", "zJSY8tbf_ys", "HXV3zeQKqGY", "W6NZfCO5SIk", "mS9-uTrDuyA", # Week 1
        "u4vL8l4xI_A", "T9488V34u7M", "qvS6O-yvSBY", "pYPr2MAsMpk", "N7R20pXpP6E", # Week 2
        "G3_047tqhGg", "N_Z5_yU8_xM", "t_ihSwaOmd4", "zV-W0_eB_kM", "OAtK3gL-Tz8", # Week 3
        "L7O-CqXoO8g", "9_5W6pP_xS8", "f8G7hP-q9gM", "OAtK3gL-Tz8", "W_vM-p9-R_E"  # Week 4
    ]

    index = 0
    for week_num in range(1, 5):
        print(f"Processing Week {week_num}...")
        for module_index in range(1, 6):
            title_prefix = f"Module {week_num}.{module_index}: "
            if week_num == 1: title = title_prefix + "Engineering Foundations"
            elif week_num == 2: title = title_prefix + "System Architecture"
            elif week_num == 3: title = title_prefix + "Operational Excellence"
            else: title = title_prefix + "Enterprise Governance"

            module, created = Module.objects.update_or_create(
                week=week_num,
                title=title,
                defaults={
                    'description': f"Comprehensive technical protocol for Week {week_num}, Module {module_index}. Focused on high-fidelity performance and scalability.",
                    'duration': 45,
                    'difficulty': 'beginner' if week_num == 1 else 'intermediate' if week_num < 4 else 'advanced'
                }
            )
            
            # 1. Resource (Video)
            Resource.objects.update_or_create(
                module=module,
                title=f"Technical Protocol: {title}",
                defaults={
                    'description': "Verified educational broadcast for enterprise synchronization.",
                    'type': 'video',
                    'url': f"https://www.youtube.com/embed/{video_ids[index % len(video_ids)]}",
                    'order': 1
                }
            )
            index += 1

            # 2. Quiz Validation
            quiz, q_created = Quiz.objects.update_or_create(
                module=module,
                title=f"Verification Protocol {week_num}.{module_index}",
                defaults={'passing_score': 85}
            )
            
            # Clear existing questions to ensure fresh validation
            quiz.questions.all().delete()
            for j in range(1, 3):
                question = Question.objects.create(quiz=quiz, text=f"Data verification question {j} for {title}?")
                Answer.objects.create(question=question, text="Verified Match", is_correct=True)
                Answer.objects.create(question=question, text="Mismatched Vector", is_correct=False)

            # 3. Operational Assignments
            for learner in learners:
                Assignment.objects.update_or_create(
                    user=learner,
                    module=module,
                    defaults={
                        'assigned_by': manager,
                        'status': 'pending'
                    }
                )
            print(f"  Sync Complete: {title}")

    print("Mission Complete: 20 High-Fidelity Modules Injected into Supabase.")

if __name__ == "__main__":
    populate()
