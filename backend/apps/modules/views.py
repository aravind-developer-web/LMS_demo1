from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Module, Resource
from .serializers import ModuleSerializer, ResourceSerializer, ResourceCreateSerializer

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all().order_by('-created_at')
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role in ['manager', 'admin']:
            serializer.save()
        else:
            raise permissions.PermissionDenied("Unauthorized")

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResourceCreateView(generics.CreateAPIView):
    serializer_class = ResourceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        module_id = self.kwargs['module_id']
        if self.request.user.role in ['manager', 'admin']:
            serializer.save(module_id=module_id)
        else:
            raise permissions.PermissionDenied("Unauthorized")
