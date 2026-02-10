from django.core.management.base import BaseCommand
from apps.quiz.models import Quiz, Question, Answer
from apps.modules.models import Module

class Command(BaseCommand):
    help = 'Seeds quizzes with questions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding quiz questions...')

        # 1. Get Quizzes
        quizzes = Quiz.objects.all()
        for quiz in quizzes:
            # Check if quiz has questions
            # Clear existing questions to fix "Mistakes"
            if quiz.questions.exists():
                self.stdout.write(f'Updating {quiz.title} (clearing old data)...')
                quiz.questions.all().delete()

            self.stdout.write(f'Populating {quiz.title}...')
            
            # Create Generic Questions based on title
            if 'REACT' in quiz.title.upper() or 'FRONTEND' in quiz.title.upper():
                q1 = Question.objects.create(quiz=quiz, text="What is the Virtual DOM?", order=1)
                Answer.objects.create(question=q1, text="A copy of the real DOM kept in memory", is_correct=True)
                Answer.objects.create(question=q1, text="A specific browser API", is_correct=False)
                Answer.objects.create(question=q1, text="A database for React", is_correct=False)

                q2 = Question.objects.create(quiz=quiz, text="Which hook is used for side effects?", order=2)
                Answer.objects.create(question=q2, text="useEffect", is_correct=True)
                Answer.objects.create(question=q2, text="useState", is_correct=False)
                Answer.objects.create(question=q2, text="useReducer", is_correct=False)

            elif 'DJANGO' in quiz.title.upper() or 'BACKEND' in quiz.title.upper() or 'API' in quiz.title.upper():
                 q1 = Question.objects.create(quiz=quiz, text="What does MVT stand for?", order=1)
                 Answer.objects.create(question=q1, text="Model View Template", is_correct=True)
                 Answer.objects.create(question=q1, text="Model View Controller", is_correct=False)

                 q2 = Question.objects.create(quiz=quiz, text="Which file handles URL routing?", order=2)
                 Answer.objects.create(question=q2, text="urls.py", is_correct=True)
                 Answer.objects.create(question=q2, text="models.py", is_correct=False)

            elif 'AI' in quiz.title.upper() or 'LLM' in quiz.title.upper() or 'TRANSFORMER' in quiz.title.upper():
                 q1 = Question.objects.create(quiz=quiz, text="What is the core mechanism of Transformers?", order=1)
                 Answer.objects.create(question=q1, text="Self-Attention", is_correct=True)
                 Answer.objects.create(question=q1, text="Convolution", is_correct=False)
                 Answer.objects.create(question=q1, text="Recurrence", is_correct=False)
                 
                 q2 = Question.objects.create(quiz=quiz, text="What does GPT stand for?", order=2)
                 Answer.objects.create(question=q2, text="Generative Pre-trained Transformer", is_correct=True)
                 Answer.objects.create(question=q2, text="General Purpose Text", is_correct=False)

            else:
                 # Generic Fallback
                 q1 = Question.objects.create(quiz=quiz, text="Is this a true statement?", order=1)
                 Answer.objects.create(question=q1, text="Yes", is_correct=True)
                 Answer.objects.create(question=q1, text="No", is_correct=False)

        self.stdout.write(self.style.SUCCESS('Quiz seeding complete'))
