from rest_framework import views, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .intelligence import IntelligenceEngine
from .models import ManagerAction

User = get_user_model()

class ManagerAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _is_manager(self, request):
        return request.user.is_staff or getattr(request.user, 'role', '') in ['manager', 'admin']

    @action(detail=False, methods=['get'], url_path='team-summary')
    def team_summary(self, request):
        """Section 1: Team Activity Snapshot"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        return Response(IntelligenceEngine.get_team_snapshot())

    @action(detail=False, methods=['get'], url_path='learners')
    def learners_list(self, request):
        """Section 2: Learner Tracking Table"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        learners = User.objects.filter(is_staff=False, role='learner')
        data = [IntelligenceEngine.get_learner_snapshot(l) for l in learners]
        return Response(data)

    @action(detail=True, methods=['get'], url_path='details')
    def learner_details(self, request, pk=None):
        """Section 3: Individual Learner Detail (4 Tabs)"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        learner = get_object_or_404(User, pk=pk)
        return Response(IntelligenceEngine.get_learner_details(learner))

    @action(detail=True, methods=['get'], url_path='risk')
    def learner_risk(self, request, pk=None):
        """Section 5: Risk Detection Engine"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        learner = get_object_or_404(User, pk=pk)
        return Response(IntelligenceEngine.get_risk_assessment(learner))

    @action(detail=False, methods=['post'], url_path='record-action')
    def record_action(self, request):
        """Section 6: Manager Action Center"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        learner_id = request.data.get('learner_id')
        action_type = request.data.get('action_type')
        description = request.data.get('description', '')
        
        learner = get_object_or_404(User, pk=learner_id)
        
        action = ManagerAction.objects.create(
            manager=request.user,
            learner=learner,
            action_type=action_type,
            description=description
        )
        
        return Response({"status": "action_recorded", "id": action.id})

    # Legacy views migrated/restructured as needed...
