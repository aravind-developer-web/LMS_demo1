from rest_framework import generics, permissions
from .models import ModuleProgress
from .serializers import ModuleProgressSerializer
from django.utils import timezone

class ProgressListView(generics.ListAPIView):
    serializer_class = ModuleProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ModuleProgress.objects.filter(user=self.request.user)

class ProgressUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ModuleProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        module_id = self.kwargs.get('module_id')
        obj, created = ModuleProgress.objects.get_or_create(
            user=self.request.user,
            module_id=module_id
        )
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'completed' and not instance.completed_at:
            instance.completed_at = timezone.now()
            instance.save()
