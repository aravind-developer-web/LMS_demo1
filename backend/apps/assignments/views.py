from rest_framework import generics, permissions
from .models import Assignment
from .serializers import AssignmentSerializer, SubmissionSerializer

class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user)

    def perform_create(self, serializer):
        # Admin assigns module to user
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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Submission

class SubmissionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        print(f"DEBUG: SubmissionCreateView hit for module {module_id}, user {request.user}")
        # Open Access: Auto-create assignment if it doesn't exist for this learner
        from apps.modules.models import Module
        
        # Open Access: Atomic Auto-enrollment
        from apps.modules.models import Module
        
        assignment, created = Assignment.objects.get_or_create(
            user=request.user, 
            module_id=module_id,
            defaults={
                'assigned_by': request.user, # Self-enrolled
                'status': 'in_progress'
            }
        )

        serializer = SubmissionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(assignment=assignment)
            
            # Principal Progress Sync
            from apps.modules.models import ModuleProgress
            mod_progress, _ = ModuleProgress.objects.get_or_create(user=request.user, module=module)
            mod_progress.check_completion()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        return Submission.objects.filter(assignment__user=self.request.user, assignment__module_id=module_id)
