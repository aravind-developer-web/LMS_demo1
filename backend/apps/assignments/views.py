from rest_framework import generics, permissions
from .models import Assignment
from .serializers import AssignmentSerializer

class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.role == 'manager':
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
        if user.role == 'admin' or user.role == 'manager':
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user)
