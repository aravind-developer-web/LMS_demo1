from rest_framework import generics, permissions
from .models import Module, Resource
from .serializers import ModuleSerializer, ResourceSerializer, ModuleProgressSerializer, ResourceCreateSerializer

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all().order_by('-created_at')
    serializer_class = ModuleSerializer
    permission_classes = [permissions.AllowAny]  # Open learning catalog

    def perform_create(self, serializer):
        # Managers and Admins can create
        if self.request.user.is_authenticated and self.request.user.role in ['manager', 'admin']:
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only Managers and Admins can create modules.")


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Allow authenticated access

    def retrieve(self, request, *args, **kwargs):
        """
        Allow READ access to all modules (open learning).
        Add assignment status to response for UI messaging.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Check assignment status for authenticated learners (for UI, not blocking)
        if request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'learner':
            from apps.assignments.models import Assignment
            has_assignment = Assignment.objects.filter(user=request.user, module=instance).exists()
            
            # Add assignment info to response (UI will use this)
            data['is_assigned'] = has_assignment
            data['assignment_message'] = None if has_assignment else "This module is not assigned — progress will not be tracked"
        else:
            data['is_assigned'] = True  # Admins/managers always have full access
            data['assignment_message'] = None
        
        return Response(data)


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import ModuleProgress, ResourceProgress

class ModuleProgressView(generics.RetrieveAPIView):
    serializer_class = ModuleProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        module_id = self.kwargs['pk']
        module = generics.get_object_or_404(Module, pk=module_id)
        progress, created = ModuleProgress.objects.get_or_create(user=self.request.user, module=module)
        return progress

from apps.analytics.models import LearningSession
from django.db.models import F

class UpdateResourceProgressView(APIView):
    """
    Unified Progress Endpoint.
    Handles: 
    - Pulse tracking (F() watch time + LearningSession focus time)
    - Manual/Auto completion
    - Completion triggers mapping back to ModuleProgress
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_or_create_session(self, user):
        one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
        session = LearningSession.objects.filter(
            user=user, 
            start_time__gte=one_hour_ago
        ).order_by('-start_time').first()
        
        if not session:
            session = LearningSession.objects.create(user=user)
        return session

    def post(self, request, module_id, resource_id):
        resource = generics.get_object_or_404(Resource, pk=resource_id, module_id=module_id)
        res_progress, created = ResourceProgress.objects.get_or_create(user=request.user, resource=resource)
        mod_progress, _ = ModuleProgress.objects.get_or_create(user=request.user, module_id=module_id)

        # 1. Update State (Absolute vs Incremental)
        pulse_delta = request.data.get('duration_delta')
        absolute_watch_time = request.data.get('watch_time')
        last_position = request.data.get('last_position')
        force_complete = request.data.get('completed', False)

        if pulse_delta:
            # Atomic focus increment
            res_progress.watch_time_seconds = F('watch_time_seconds') + int(pulse_delta)
            
            # Update Learning Session
            session = self._get_or_create_session(request.user)
            session.focus_duration_seconds = F('focus_duration_seconds') + int(pulse_delta)
            session.end_time = timezone.now()
            session.save()

        if absolute_watch_time is not None:
            res_progress.watch_time_seconds = int(absolute_watch_time)
        
        if last_position is not None:
            res_progress.last_position_seconds = int(last_position)

        # 2. Completion Logic
        if force_complete and not res_progress.completed:
            res_progress.completed = True
            res_progress.completed_at = timezone.now()
        
        res_progress.save()

        # Update last_accessed on module
        if mod_progress.status == 'not_started':
            mod_progress.status = 'in_progress'
        mod_progress.save()

        # 3. Principled Completion Check
        is_module_done = mod_progress.check_completion()

        return Response({
            "status": "synchronized", 
            "resource_completed": res_progress.completed,
            "module_status": mod_progress.status
        })

class UpdateVideoProgressView(UpdateResourceProgressView):
    """Alias for backward compatibility with existing frontend heartbeat if needed."""
    pass

class ResourceCreateView(generics.CreateAPIView):
    serializer_class = ResourceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        module_id = self.kwargs['module_id']
        module = generics.get_object_or_404(Module, pk=module_id)
        if self.request.user.role not in ['manager', 'admin']:
             raise permissions.PermissionDenied("Only Managers and Admins can add resources.")
        serializer.save(module=module)

class AssignModuleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        if request.user.role not in ['manager', 'admin']:
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        module = generics.get_object_or_404(Module, pk=module_id)
        learner_id = request.data.get('learner_id')
        
        # Check if learner exists
        from django.contrib.auth import get_user_model
        User = get_user_model()
        learner = generics.get_object_or_404(User, pk=learner_id, role='learner')

        # Create or get progress (Assign)
        ModuleProgress.objects.get_or_create(user=learner, module=module)
        
        return Response({"status": "assigned", "module": module.title, "learner": learner.username})
