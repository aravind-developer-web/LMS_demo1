"""
Learner Intelligence Engine — Cognitive State Derivation

This module computes learner cognitive states from telemetry data.
States are derived server-side and NEVER computed in the frontend.

Cognitive States:
- CRITICAL: No activity >72h AND incomplete modules
- STRUGGLING: Low focus + failed quizzes
- STABLE: Regular activity, moderate progress
- HIGH_VELOCITY: High focus + recent completions
- SKILL_READY: High quiz scores + completed modules
"""

from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Sum, Count, Q, Max
from django.contrib.auth import get_user_model

from apps.modules.models import ModuleProgress, ResourceProgress
from apps.analytics.models import LearningSession
from apps.quiz.models import QuizAttempt
from apps.assignments.models import Assignment, Submission

User = get_user_model()


class CognitiveState:
    """Enum-like class for cognitive states"""
    CRITICAL = "CRITICAL"
    STRUGGLING = "STRUGGLING"
    STABLE = "STABLE"
    HIGH_VELOCITY = "HIGH_VELOCITY"
    SKILL_READY = "SKILL_READY"
    UNENGAGED = "UNENGAGED"


class LearnerIntelligenceEngine:
    """
    Server-side intelligence engine for deriving learner cognitive states.
    All computations use DB aggregations, not Python loops.
    """

    @staticmethod
    def compute_cognitive_state(user):
        """
        Derive cognitive state from telemetry data.
        
        Returns: (state, risk_score, velocity, risk_factors)
        """
        now = timezone.now()
        
        # Time windows
        last_24h = now - timedelta(hours=24)
        last_72h = now - timedelta(hours=72)
        last_7d = now - timedelta(days=7)
        
        # Fetch aggregated metrics
        last_session = LearningSession.objects.filter(user=user).order_by('-start_time').first()
        total_focus = LearningSession.objects.filter(
            user=user,
            start_time__gte=last_7d
        ).aggregate(Sum('focus_duration_seconds'))['focus_duration_seconds__sum'] or 0
        
        modules_completed = ModuleProgress.objects.filter(
            user=user,
            status='completed'
        ).count()
        
        modules_in_progress = ModuleProgress.objects.filter(
            user=user,
            status='in_progress'
        ).count()
        
        quiz_avg = QuizAttempt.objects.filter(
            user=user,
            timestamp__gte=last_7d
        ).aggregate(Avg('score'))['score__avg'] or 0
        
        quiz_pass_rate = QuizAttempt.objects.filter(
            user=user,
            timestamp__gte=last_7d,
            passed=True
        ).count()
        
        total_quizzes = QuizAttempt.objects.filter(
            user=user,
            timestamp__gte=last_7d
        ).count()
        
        # Velocity: completions per day in last 7 days
        recent_completions = ModuleProgress.objects.filter(
            user=user,
            completed_at__gte=last_7d
        ).count()
        velocity = round(recent_completions / 7, 2)
        
        # Risk factors
        risk_factors = []
        risk_score = 0
        
        # CRITICAL CHECKS
        if not last_session or last_session.start_time < last_72h:
            risk_factors.append("No activity >72h")
            risk_score += 40
        
        if modules_in_progress > 0 and total_focus < 600:  # <10 min in 7 days
            risk_factors.append("Low engagement")
            risk_score += 30
        
        if total_quizzes > 0 and quiz_avg < 50:
            risk_factors.append("Low quiz scores")
            risk_score += 20
        
        if modules_in_progress > 3 and modules_completed == 0:
            risk_factors.append("No completions")
            risk_score += 10
        
        # DETERMINE COGNITIVE STATE
        state = CognitiveState.UNENGAGED
        
        # Priority order (most critical first)
        if risk_score >= 70:
            state = CognitiveState.CRITICAL
        elif quiz_avg < 60 and total_quizzes > 0:
            state = CognitiveState.STRUGGLING
        elif modules_completed >= 3 and quiz_avg >= 80:
            state = CognitiveState.SKILL_READY
        elif velocity >= 1.0 and total_focus > 1800:  # >30 min/week
            state = CognitiveState.HIGH_VELOCITY
        elif total_focus > 600:  # >10 min/week
            state = CognitiveState.STABLE
        
        return {
            "state": state,
            "risk_score": min(risk_score, 100),
            "velocity": velocity,
            "risk_factors": risk_factors,
            "metrics": {
                "total_focus_mins": round(total_focus / 60, 1),
                "modules_completed": modules_completed,
                "modules_in_progress": modules_in_progress,
                "quiz_avg": round(quiz_avg, 1),
                "quiz_pass_rate": round((quiz_pass_rate / total_quizzes * 100) if total_quizzes > 0 else 0, 1)
            }
        }

    @staticmethod
    def get_intelligence_overview():
        """
        Get intelligence overview for all learners.
        Returns summary stats + individual learner nodes.
        """
        learners = User.objects.filter(is_staff=False, role='learner')
        
        nodes = []
        state_counts = {
            CognitiveState.CRITICAL: 0,
            CognitiveState.STRUGGLING: 0,
            CognitiveState.STABLE: 0,
            CognitiveState.HIGH_VELOCITY: 0,
            CognitiveState.SKILL_READY: 0,
            CognitiveState.UNENGAGED: 0
        }
        
        for learner in learners:
            intelligence = LearnerIntelligenceEngine.compute_cognitive_state(learner)
            
            # Get last activity
            last_session = LearningSession.objects.filter(user=learner).order_by('-start_time').first()
            
            node = {
                "learner_id": learner.id,
                "name": learner.username,
                "email": learner.email,
                "cognitive_state": intelligence['state'],
                "velocity": intelligence['velocity'],
                "risk_score": intelligence['risk_score'],
                "risk_factors": intelligence['risk_factors'],
                "last_active": last_session.start_time.isoformat() if last_session else None,
                "metrics": intelligence['metrics']
            }
            
            nodes.append(node)
            state_counts[intelligence['state']] += 1
        
        return {
            "summary": {
                "critical": state_counts[CognitiveState.CRITICAL],
                "struggling": state_counts[CognitiveState.STRUGGLING],
                "stable": state_counts[CognitiveState.STABLE],
                "high_velocity": state_counts[CognitiveState.HIGH_VELOCITY],
                "skill_ready": state_counts[CognitiveState.SKILL_READY],
                "unengaged": state_counts[CognitiveState.UNENGAGED],
                "total_learners": learners.count(),
                "last_updated": timezone.now().isoformat()
            },
            "nodes": nodes,
            "computed_at": timezone.now().isoformat()
        }
