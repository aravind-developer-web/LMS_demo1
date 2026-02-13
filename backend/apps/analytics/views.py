from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count
from apps.progress.models import ModuleProgress

User = get_user_model()

class ManagerAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _is_manager(self, request):
        return request.user.is_staff or getattr(request.user, 'role', '') in ['manager', 'admin']

    def list(self, request):
        """Basic team summary for managers."""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=403)
        
        learner_count = User.objects.filter(role='learner').count()
        completed_count = ModuleProgress.objects.filter(status='completed').count()
        
        return Response({
            "total_learners": learner_count,
            "total_completions": completed_count
        })
