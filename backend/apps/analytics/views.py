from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.modules.models import Module, ModuleProgress
from apps.quiz.models import QuizAttempt
from django.contrib.auth import get_user_model

User = get_user_model()

class TeamStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Totals
        total_learners = User.objects.filter(role='learner').count()
        total_enrollments = ModuleProgress.objects.count()
        # Use simple filter first for general status
        total_completions = ModuleProgress.objects.filter(status='completed').count()
        
        avg_quiz_score = QuizAttempt.objects.aggregate(Avg('score'))['score__avg'] or 0

        # Timeline Data (Last 7 days) - Robust Timezone Handling
        today = timezone.now().date()
        last_7_days = []
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            # Filter by matching year, month, and day for maximal seed compatibility
            completions = ModuleProgress.objects.filter(
                status='completed',
                completed_at__year=target_date.year,
                completed_at__month=target_date.month,
                completed_at__day=target_date.day
            ).count()
            
            last_7_days.append({
                "date": target_date.strftime("%b %d"),
                "completions": completions
            })

        # Assignment Stats
        total_assignments = Assignment.objects.count()
        pending_review = Submission.objects.filter(status='pending').count()

        return Response({
            "summary": {
                "total_learners": total_learners,
                "total_completions": total_completions,
                "completion_rate": (total_completions / total_enrollments * 100) if total_enrollments > 0 else 0,
                "avg_quiz_score": round(avg_quiz_score, 1),
                "assignments_pending": pending_review,
                "total_assignments": total_assignments
            },
            "timeline": last_7_days
        })

class RecentActivityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Fetch recent quiz attempts
        quiz_attempts = QuizAttempt.objects.select_related('user', 'quiz').order_by('-timestamp')[:5]
        attempts_data = [{
            "type": "quiz",
            "user": a.user.username,
            "title": a.quiz.title,
            "status": f"{a.score}% - {'Passed' if a.passed else 'Failed'}",
            "time": a.timestamp
        } for a in quiz_attempts]

        # Fetch recent assignment submissions
        submissions = Submission.objects.select_related('assignment__user', 'assignment__module').order_by('-submitted_at')[:5]
        submissions_data = [{
            "type": "assignment",
            "user": s.assignment.user.username,
            "title": s.assignment.module.title,
            "status": "Submitted",
            "time": s.submitted_at
        } for s in submissions]

        # Combine and sort
        combined = sorted(attempts_data + submissions_data, key=lambda x: x['time'], reverse=True)[:10]
        
        return Response(combined)

class StuckLearnersView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # A learner is "stuck" if they have an 'in_progress' module not updated in 7 days
        threshold = timezone.now() - timedelta(days=7)
        stuck_progress = ModuleProgress.objects.filter(
            status='in_progress',
            last_accessed__lt=threshold
        ).select_related('user', 'module')

        data = [{
            "id": p.user.id,
            "username": p.user.username,
            "module_title": p.module.title,
            "last_accessed": p.last_accessed,
            "days_inactive": (timezone.now() - p.last_accessed).days
        } for p in stuck_progress]

        return Response(data)

class ModuleStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        modules = Module.objects.annotate(
            enrollment_count=Count('progress'),
            completion_count=Count('progress', filter=Q(progress__status='completed'))
        )

        data = [{
            "title": m.title,
            "enrollments": m.enrollment_count,
            "completions": m.completion_count,
            "success_rate": round(m.completion_count / m.enrollment_count * 100, 1) if m.enrollment_count > 0 else 0
        } for m in modules]

        return Response(data)
from django.db.models import Sum
from apps.modules.models import ResourceProgress

class TeamVelocityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Aggregate total watch time by module category (heuristic based on title)
        # This provides a real measure of "Velocity"
        total_watch_time = ResourceProgress.objects.aggregate(Sum('watch_time_seconds'))['watch_time_seconds__sum'] or 0
        
        # Breakdown by department-like categories
        categories = [
            {"label": "Engineering", "val": ResourceProgress.objects.filter(resource__module__title__icontains='Engineering').aggregate(Sum('watch_time_seconds'))['watch_time_seconds__sum'] or 0},
            {"label": "GenAI Nodes", "val": ResourceProgress.objects.filter(resource__module__title__icontains='GenAI').aggregate(Sum('watch_time_seconds'))['watch_time_seconds__sum'] or 0},
        ]

        # Normalize to 0-100 for the UI
        max_val = max([c['val'] for c in categories]) if categories and any(c['val'] for c in categories) else 1
        for c in categories:
            c['val'] = min(round((c['val'] / (max_val * 1.5)) * 100), 100) # Percentage of target

        return Response({
            "total_watch_time_hours": round(total_watch_time / 3600, 1),
            "velocity_breakdown": categories
        })
