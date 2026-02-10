from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q, Prefetch
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from apps.modules.models import Module, ModuleProgress

class AssignmentViewSet(viewsets.ViewSet):
    """
    Unified Assignment ViewSet for learners and managers.
    Supports both assigned and open-access discovery.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='my-assignments')
    def my_assignments(self, request):
        """
        Get all assignments for the authenticated learner.
        Includes both:
        - Explicitly assigned assignments
        - Open-access assignments from enrolled modules
        """
        user = request.user
        
        # Get explicitly assigned assignments
        assigned = Assignment.objects.filter(user=user).select_related('module', 'assigned_by')
        
        # Get open-access: modules with assignment_prompt that user is enrolled in or can access
        enrolled_modules = ModuleProgress.objects.filter(user=user).values_list('module_id', flat=True)
        open_access_modules = Module.objects.filter(
            Q(id__in=enrolled_modules) | Q(id__isnull=False)  # All modules for now (open access)
        ).exclude(assignment_prompt__isnull=True).exclude(assignment_prompt='')
        
        # Build response
        results = []
        
        # Add explicitly assigned
        for assignment in assigned:
            submission = Submission.objects.filter(assignment=assignment).order_by('-submitted_at').first()
            results.append({
                'id': assignment.id,
                'module': assignment.module.id,
                'module_title': assignment.module.title,
                'module_description': assignment.module.description,
                'assignment_prompt': assignment.module.assignment_prompt,
                'status': assignment.status,
                'due_date': assignment.due_date,
                'assigned_at': assignment.assigned_at,
                'completed_at': assignment.completed_at,
                'assigned_by': assignment.assigned_by.username if assignment.assigned_by else 'Self-enrolled',
                'submission_status': submission.status if submission else 'not_submitted',
                'submission_id': submission.id if submission else None,
                'type': 'assigned'
            })
        
        # Add open-access modules (not yet assigned)
        assigned_module_ids = {a.module.id for a in assigned}
        for module in open_access_modules:
            if module.id not in assigned_module_ids:
                results.append({
                    'id': None,  # Not yet assigned
                    'module': module.id,
                    'module_title': module.title,
                    'module_description': module.description,
                    'assignment_prompt': module.assignment_prompt,
                    'status': 'available',
                    'due_date': None,
                    'assigned_at': None,
                    'completed_at': None,
                    'assigned_by': None,
                    'submission_status': 'not_submitted',
                    'submission_id': None,
                    'type': 'open_access'
                })
        
        return Response(results)

    @action(detail=False, methods=['post'], url_path='modules/(?P<module_id>[^/.]+)/submit')
    def submit_assignment(self, request, module_id=None):
        """
        Submit assignment for a module.
        Auto-creates assignment if it doesn't exist (open-access).
        """
        user = request.user
        
        # Get or create assignment
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        
        assignment, created = Assignment.objects.get_or_create(
            user=user,
            module=module,
            defaults={
                'assigned_by': user,  # Self-enrolled
                'status': 'in_progress'
            }
        )
        
        # Create submission
        content = request.data.get('content', '')
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = Submission.objects.create(
            assignment=assignment,
            content=content,
            status='pending'
        )
        
        # Update assignment status
        assignment.status = 'completed'
        assignment.completed_at = timezone.now()
        assignment.save()
        
        # Trigger module completion check
        mod_progress, _ = ModuleProgress.objects.get_or_create(user=user, module=module)
        mod_progress.check_completion()
        
        return Response({
            'id': submission.id,
            'assignment_id': assignment.id,
            'status': 'submitted',
            'submitted_at': submission.submitted_at
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='modules/(?P<module_id>[^/.]+)/submissions')
    def get_submissions(self, request, module_id=None):
        """Get all submissions for a module by the authenticated user"""
        user = request.user
        
        try:
            assignment = Assignment.objects.get(user=user, module_id=module_id)
            submissions = Submission.objects.filter(assignment=assignment).order_by('-submitted_at')
            serializer = SubmissionSerializer(submissions, many=True)
            return Response(serializer.data)
        except Assignment.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)


class ManagerAssignmentViewSet(viewsets.ViewSet):
    """Manager-specific assignment analytics and management"""
    permission_classes = [permissions.IsAuthenticated]

    def _is_manager(self, request):
        return request.user.is_staff or getattr(request.user, 'role', '') in ['manager', 'admin']

    @action(detail=False, methods=['get'], url_path='analytics')
    def assignment_analytics(self, request):
        """Get assignment analytics for managers"""
        if not self._is_manager(request):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        total_assignments = Assignment.objects.count()
        total_submissions = Submission.objects.count()
        pending_reviews = Submission.objects.filter(status='pending').count()
        completed = Assignment.objects.filter(status='completed').count()
        overdue = Assignment.objects.filter(
            status__in=['pending', 'in_progress'],
            due_date__lt=timezone.now()
        ).count()
        
        # Submission rate
        submission_rate = round((total_submissions / total_assignments * 100) if total_assignments > 0 else 0, 1)
        
        # Recent submissions
        recent_submissions = Submission.objects.select_related(
            'assignment__user', 'assignment__module'
        ).order_by('-submitted_at')[:10]
        
        recent_data = [{
            'id': sub.id,
            'learner': sub.assignment.user.username,
            'module': sub.assignment.module.title,
            'submitted_at': sub.submitted_at,
            'status': sub.status
        } for sub in recent_submissions]
        
        return Response({
            'summary': {
                'total_assignments': total_assignments,
                'total_submissions': total_submissions,
                'pending_reviews': pending_reviews,
                'completed': completed,
                'overdue': overdue,
                'submission_rate': submission_rate
            },
            'recent_submissions': recent_data,
            'computed_at': timezone.now().isoformat()
        })

    @action(detail=False, methods=['post'], url_path='assign')
    def assign_to_learner(self, request):
        """Assign a module to a specific learner"""
        if not self._is_manager(request):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        learner_id = request.data.get('learner_id')
        module_id = request.data.get('module_id')
        due_date = request.data.get('due_date')
        
        try:
            learner = User.objects.get(id=learner_id)
            module = Module.objects.get(id=module_id)
        except (User.DoesNotExist, Module.DoesNotExist):
            return Response({'error': 'Learner or Module not found'}, status=status.HTTP_404_NOT_FOUND)
        
        assignment, created = Assignment.objects.get_or_create(
            user=learner,
            module=module,
            defaults={
                'assigned_by': request.user,
                'due_date': due_date,
                'status': 'pending'
            }
        )
        
        return Response({
            'id': assignment.id,
            'created': created,
            'message': 'Assignment created' if created else 'Assignment already exists'
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# Legacy views for backward compatibility
class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user)

class SubmissionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        assignment, created = Assignment.objects.get_or_create(
            user=request.user, 
            module_id=module_id,
            defaults={
                'assigned_by': request.user,
                'status': 'in_progress'
            }
        )

        serializer = SubmissionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(assignment=assignment)
            
            from apps.modules.models import ModuleProgress
            mod_progress, _ = ModuleProgress.objects.get_or_create(user=request.user, module_id=module_id)
            mod_progress.check_completion()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        return Submission.objects.filter(assignment__user=self.request.user, assignment__module_id=module_id)
