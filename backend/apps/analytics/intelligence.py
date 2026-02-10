import math
from django.db.models import Count, Avg, Max, Sum, F, StdDev
from django.utils import timezone
from datetime import timedelta
from apps.modules.models import ModuleProgress, ResourceProgress
from apps.quiz.models import QuizAttempt
from apps.assignments.models import Submission, Assignment
from apps.notes.models import Note
from .models import LearningSession, ManagerAction

class IntelligenceEngine:
    """
    Principal Intelligence Engine deriving factual, non-fakeable metrics.
    """

    @staticmethod
    def calculate_engagement_score(user):
        """
        Engagement Score = (focus_time + sessions + notes) / assigned_days
        Factual measure of effort.
        """
        sessions = LearningSession.objects.filter(user=user)
        total_focus_mins = (sessions.aggregate(Sum('focus_duration_seconds'))['focus_duration_seconds__sum'] or 0) / 60
        session_count = sessions.count()
        # Proxy for notes: aggregate count from a hypothetical 'Note' model or similar
        # For now, we'll use a count of module interactions as a proxy if Note model isn't explored yet
        notes_count = Note.objects.filter(user=user).count()
        
        days_enrolled = (timezone.now() - user.date_joined).days or 1
        
        score = (total_focus_mins + session_count + (notes_count * 5)) / days_enrolled
        return round(score, 2)

    @staticmethod
    def calculate_velocity_trend(user):
        """
        Velocity = Actions this week vs Actions last week.
        Returns: 'Improving', 'Stable', 'Declining'
        """
        now = timezone.now()
        this_week_start = now - timedelta(days=7)
        last_week_start = now - timedelta(days=14)

        def get_actions(start, end):
            resources = ResourceProgress.objects.filter(user=user, updated_at__range=(start, end), completed=True).count()
            quizzes = QuizAttempt.objects.filter(user=user, timestamp__range=(start, end)).count()
            return resources + (quizzes * 2)

        this_week = get_actions(this_week_start, now)
        last_week = get_actions(last_week_start, this_week_start)

        if this_week > last_week * 1.2: return "Improving"
        if this_week < last_week * 0.8: return "Declining"
        return "Stable"

    @staticmethod
    def calculate_knowledge_stability(user):
        """
        Stability = std deviation of quiz scores (lower is more stable).
        Inverse mapped to 0-100 for UI.
        """
        scores = list(QuizAttempt.objects.filter(user=user).values_list('score', flat=True))
        if len(scores) < 2:
            return 100 # Default to stable for new users
        
        mean = sum(scores) / len(scores)
        variance = sum((s - mean) ** 2 for s in scores) / len(scores)
        std_dev = math.sqrt(variance)
        
        # 0 std dev = 100 stability, 50+ std dev = 0 stability
        stability = max(0, 100 - (std_dev * 2))
        return round(stability, 1)

    @staticmethod
    def get_team_snapshot():
        """
        Snapshot 1: Team-wide metrics for Top Bar.
        """
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_72h = now - timedelta(hours=72)
        last_7d = now - timedelta(days=7)
        
        active_24h = LearningSession.objects.filter(start_time__gte=last_24h).values('user').distinct().count()
        inactive_72h = ModuleProgress.objects.filter(last_accessed__lt=last_72h).count()
        
        avg_focus = (LearningSession.objects.filter(start_time__gte=last_7d).aggregate(Avg('focus_duration_seconds'))['focus_duration_seconds__avg'] or 0) / 60
        avg_accuracy = QuizAttempt.objects.filter(timestamp__gte=last_7d).aggregate(Avg('score'))['score__avg'] or 0
        
        total_assignments = Assignment.objects.all().count()
        completed_assignments = Submission.objects.filter(status='graded').count()
        assignment_rate = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0
        
        # Risk count
        from django.contrib.auth import get_user_model
        User = get_user_model()
        learners = User.objects.filter(is_staff=False, role='learner')
        risk_count = 0
        for l in learners:
            if IntelligenceEngine.get_risk_assessment(l)['level'] == "High":
                risk_count += 1

        return {
            "active_24h": active_24h,
            "inactive_72h": inactive_72h,
            "avg_focus_mins": round(avg_focus, 1),
            "avg_accuracy": round(avg_accuracy, 1),
            "assignment_rate": round(assignment_rate, 1),
            "at_risk_count": risk_count,
            "computed_at": timezone.now().isoformat(),
            "data_freshness_seconds": 0  # Real-time computation
        }

    @staticmethod
    def get_learner_details(user):
        """
        Drill-down Analytics for the 4-Tab detail panel.
        """
        # TAB 1: ACTIVITY TIMELINE
        sessions = LearningSession.objects.filter(user=user).order_by('-start_time')
        timeline = [{
            "start": s.start_time,
            "end": s.end_time,
            "duration": s.focus_duration_seconds,
            "events": [] # Future: detailed resource sub-events
        } for s in sessions[:20]]

        # TAB 2: QUIZ PERFORMANCE
        quizzes = QuizAttempt.objects.filter(user=user).select_related('quiz').order_by('-timestamp')
        quiz_data = [{
            "title": q.quiz.title,
            "score": q.score,
            "passed": q.passed,
            "timestamp": q.timestamp,
            "time_spent": 0 # Placeholder for time-per-question data
        } for q in quizzes]

        # TAB 3: ASSIGNMENTS
        assignments = Assignment.objects.filter(user=user).order_by('-created_at')
        assignment_data = []
        for a in assignments:
            sub = Submission.objects.filter(assignment=a).first()
            assignment_data.append({
                "title": a.module.title,
                "assigned": a.created_at,
                "submitted": sub.submitted_at if sub else None,
                "status": sub.status if sub else "Pending",
                "grade": sub.grade if sub else None
            })

        # TAB 4: NOTES & ENGAGEMENT
        # This would pull from a Note model. For now, we'll return a structured placeholder.
        user_notes = Note.objects.filter(user=user)
        note_stats = {
            "count": user_notes.count(),
            "last_update": user_notes.aggregate(Max('updated_at'))['updated_at__max'],
            "revisited": 0 # Logic for revisits can be added later
        }

        # Quality Signals
        engagement = IntelligenceEngine.calculate_engagement_score(user)
        stability = IntelligenceEngine.calculate_knowledge_stability(user)
        velocity = IntelligenceEngine.calculate_velocity_trend(user)

        return {
            "timeline": timeline,
            "quizzes": quiz_data,
            "assignments": assignment_data,
            "notes": note_stats,
            "quality": {
                "engagement": engagement,
                "stability": stability,
                "velocity": velocity
            },
            "computed_at": timezone.now().isoformat()
        }

    @staticmethod
    def get_risk_assessment(user):
        """
        Factual Risk Triggers.
        """
        triggers = []
        
        # 1. Inactivity
        last_session = LearningSession.objects.filter(user=user).order_by('-end_time').first()
        if not last_session:
            triggers.append({"code": "NO_ACTIVITY", "msg": "No recorded sessions", "detected": user.date_joined})
        else:
            days_idle = (timezone.now() - (last_session.end_time or last_session.start_time)).days
            if days_idle > 3:
                triggers.append({"code": "STAGNANT", "msg": f"Inactive for {days_idle} days", "detected": last_session.end_time})

        # 2. Quiz Failures
        recent_fails = QuizAttempt.objects.filter(user=user, passed=False).count()
        if recent_fails >= 2:
            triggers.append({"code": "REPEATED_FAIL", "msg": f"{recent_fails} Quiz Failures detected", "detected": timezone.now()})

        # 3. Overdue
        overdue = Assignment.objects.filter(user=user, status='overdue').count()
        if overdue > 0:
            triggers.append({"code": "OVERDUE", "msg": f"{overdue} Overdue Assignments", "detected": timezone.now()})

        level = "High" if len(triggers) >= 2 else "Medium" if len(triggers) == 1 else "Low"
        return {
            "level": level,
            "triggers": triggers
        }

    @staticmethod
    def get_learner_snapshot(user):
        """
        Aggregates metrics for Section 2 (Core Table).
        """
        last_progress = ModuleProgress.objects.filter(user=user).order_by('-last_accessed').first()
        risk = IntelligenceEngine.get_risk_assessment(user)
        
        return {
            "id": user.id,
            "name": user.username,
            "last_active": last_progress.last_accessed if last_progress else None,
            "current_module": last_progress.module.title if last_progress else "None",
            "status": "Stuck" if risk['level'] == "High" else "Idle" if risk['level'] == "Medium" else "Active",
            "focus_time_7d": (LearningSession.objects.filter(user=user, start_time__gte=timezone.now()-timedelta(days=7)).aggregate(Sum('focus_duration_seconds'))['focus_duration_seconds__sum'] or 0) / 60,
            "quiz_avg": QuizAttempt.objects.filter(user=user).aggregate(Avg('score'))['score__avg'] or 0,
            "quiz_attempts": QuizAttempt.objects.filter(user=user).count(),
            "assignment_pct": (Submission.objects.filter(assignment__user=user, status='graded').count() / (Assignment.objects.filter(user=user).count() or 1)) * 100,
            "velocity": IntelligenceEngine.calculate_velocity_trend(user),
            "risk_level": risk['level'],
            "action_needed": "Yes" if risk['level'] == "High" else "No"
        }
