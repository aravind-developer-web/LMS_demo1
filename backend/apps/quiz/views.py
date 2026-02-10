from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Quiz, QuizAttempt, Question, Answer
from .serializers import QuizSerializer, QuizAttemptSerializer

class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return quizzes for modules the learner sees
        return Quiz.objects.filter(module__isnull=False) # Simplified for now, can filter by enrollment


class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'module_id'

class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        quiz = get_object_or_404(Quiz, module_id=module_id)
        user_answers = request.data.get('answers', {}) # Dict of {question_id: answer_id}

        score = 0
        total_questions = quiz.questions.count()
        if total_questions == 0:
            return Response({'error': 'Quiz has no questions'}, status=status.HTTP_400_BAD_REQUEST)

        for q_id, a_id in user_answers.items():
            try:
                question = Question.objects.get(id=q_id, quiz=quiz)
                selected_answer = Answer.objects.get(id=a_id, question=question)
                if selected_answer.is_correct:
                    score += 1
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue

        percentage = (score / total_questions) * 100
        passed = percentage >= quiz.passing_score

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=percentage,
            passed=passed
        )

        # Principal Progress Sync
        if passed:
            from apps.modules.models import ModuleProgress
            mod_progress, _ = ModuleProgress.objects.get_or_create(user=request.user, module_id=module_id)
            mod_progress.check_completion()

        # Update module progress potentially here or via signals
        # For now just return result
        return Response({
            'score': percentage,
            'passed': passed,
            'attempt_id': attempt.id
        })
