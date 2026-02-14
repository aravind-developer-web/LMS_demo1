from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Avg, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import VideoProgress, LearningSession
from apps.quiz.models import QuizAttempt
from apps.assignments.models import Assignment
from apps.modules.models import Module

User = get_user_model()

class ManagerLearnerProgressView(APIView):
    """
    Control Tower API: Aggregates real-time learner progress.
    Formula: (0.4 * video) + (0.3 * quiz) + (0.3 * assignment)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only managers/admins should see this
        if request.user.role not in ['manager', 'admin', 'oversight']:
            return Response({'error': 'Unauthorized'}, status=403)

        learners = User.objects.filter(role='learner').order_by('username')
        total_modules = Module.objects.count() or 1
        
        data = []
        for learner in learners:
            # 1. Video Progress
            video_avg = VideoProgress.objects.filter(user=learner).aggregate(avg=Avg('completion_percent'))['avg'] or 0.0
            
            # 2. Quiz Progress
            quiz_avg = QuizAttempt.objects.filter(user=learner).aggregate(avg=Avg('score'))['avg'] or 0.0
            
            # 3. Assignment Progress
            modules_with_assignments = Module.objects.filter(has_assignment=True).count() or 1
            completed_assignments = Assignment.objects.filter(user=learner, status='completed').count()
            assignment_avg = (completed_assignments / modules_with_assignments) * 100
            
            # 4. Total Time
            total_seconds = LearningSession.objects.filter(user=learner).aggregate(total=Sum('total_seconds'))['total'] or 0
            
            # 5. Overall Calculation
            overall = (0.4 * video_avg) + (0.3 * quiz_avg) + (0.3 * assignment_avg)
            overall = min(100.0, max(0.0, overall))

            # 6. Status Calculation (Active/Slow/Stuck/Offline)
            last_session = LearningSession.objects.filter(user=learner).order_by('-last_ping_at').first()
            is_active = False
            if last_session:
                # Active if pinged in last 5 minutes
                if (timezone.now() - last_session.last_ping_at).total_seconds() < 300:
                    is_active = True

            if is_active:
                status_str = 'active'
            elif overall > 0 and overall < 30:
                status_str = 'stuck'
            elif overall >= 30 and overall < 50:
                status_str = 'slow'
            else:
                status_str = 'offline'

            # Health Color
            if overall >= 70: health = 'GREEN'
            elif overall >= 40: health = 'ORANGE'
            else: health = 'RED'

            # Format time string
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            time_str = f"{hours}h {minutes}m"

            data.append({
                'id': learner.id,
                'name': learner.username, 
                'email': learner.email,
                'progress': round(overall, 1),
                'time_invested': time_str,
                'video_score': round(video_avg, 1),
                'quiz_score': round(quiz_avg, 1),
                'assignment_score': round(assignment_avg, 1),
                'health': health,
                'status': status_str,
                'rank': 0 # Frontend can handle ranking
            })

        # Sort by progress desc
        data.sort(key=lambda x: x['progress'], reverse=True)
        for i, item in enumerate(data):
            item['rank'] = i + 1

        return Response(data)

class ManagerLearnerDetailsView(APIView):
    """
    Drill-down API: Returns detailed analytics for a specific learner.
    Includes: Weekly Mastery, Recent Activity, Module Breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        if request.user.role not in ['manager', 'admin', 'oversight']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        try:
            learner = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Learner not found'}, status=404)

        # 1. Weekly Mastery (Last 4 weeks)
        today = timezone.now()
        weekly_mastery = []
        for i in range(4):
            start_date = today - timedelta(days=(i+1)*7)
            end_date = today - timedelta(days=i*7)
            
            # Calculate activity in this week
            # For simplicity, let's sum session time in this week
            seconds = LearningSession.objects.filter(
                user=learner, 
                last_ping_at__range=(start_date, end_date)
            ).aggregate(total=Sum('total_seconds'))['total'] or 0
            
            # Normalize to some score (e.g. 5 hours = 100%)
            score = min(100, (seconds / (5 * 3600)) * 100)
            
            weekly_mastery.append({
                'week': f"Week {4-i}", 
                'score': round(score, 1),
                'label': f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}"
            })
        weekly_mastery.reverse()

        # 2. Recent Activity
        recent_sessions = LearningSession.objects.filter(user=learner).order_by('-last_ping_at')[:5]
        recent_activity = []
        for session in recent_sessions:
            recent_activity.append({
                'id': session.id,
                'module': session.module.title,
                'action': 'Learning Session',
                'time': session.last_ping_at.strftime('%Y-%m-%d %H:%M'),
                'duration': f"{session.total_seconds // 60}m"
            })

        # 3. Module Breakdown
        modules = Module.objects.all()
        module_breakdown = []
        for module in modules:
            vp = VideoProgress.objects.filter(user=learner, module=module).first()
            qa = QuizAttempt.objects.filter(user=learner, quiz__module=module).order_by('-score').first()
            assn = Assignment.objects.filter(user=learner, module=module).first()
            
            module_breakdown.append({
                'id': module.id,
                'title': module.title,
                'video_progress': round(vp.completion_percent, 1) if vp else 0,
                'quiz_score': qa.score if qa else 0,
                'assignment_status': assn.status if assn else 'Pending'
            })

        return Response({
            'learner': {
                'id': learner.id,
                'name': learner.username,
                'email': learner.email,
                'role': learner.role
            },
            'weekly_mastery': weekly_mastery,
            'recent_activity': recent_activity,
            'module_breakdown': module_breakdown
        })

class VideoProgressUpdateView(APIView):
    """
    Telemetry Endpoint: updates video progress real-time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        video_id = request.data.get('video_id')
        module_id = request.data.get('module_id')
        watched = float(request.data.get('watched_seconds', 0))
        total = float(request.data.get('total_seconds', 1))
        
        if not all([video_id, module_id]):
            return Response({'error': 'Missing data'}, status=400)

        percent = (watched / total) * 100
        percent = min(100.0, percent) # Cap at 100

        # Update VideoProgress
        vp, created = VideoProgress.objects.update_or_create(
            user=request.user,
            video_id=video_id,
            module_id=module_id,
            defaults={
                'watched_seconds': watched,
                'total_seconds': total,
                'completion_percent': percent
            }
        )

        return Response({'status': 'updated', 'percent': percent})

class SessionPingView(APIView):
    """
    Heartbeat Endpoint: increments active learning time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        module_id = request.data.get('module_id')
        if not module_id:
            return Response({'error': 'Missing module_id'}, status=400)
            
        session, created = LearningSession.objects.get_or_create(
            user=request.user,
            module_id=module_id,
            status='active',
            defaults={'total_seconds': 0}
        )
        
        session.total_seconds += 10 # Assume 10s ping
        session.save()
        
        return Response({'status': 'pong', 'total': session.total_seconds})
