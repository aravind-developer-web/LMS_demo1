from rest_framework import generics, permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Module, Resource
from .serializers import ModuleSerializer, ResourceSerializer, ResourceCreateSerializer

class StreamView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        title = request.data.get('title')
        url = request.data.get('url')
        
        if not title or not url:
            return Response({"error": "Title and URL are required"}, status=400)

        module = Module.objects.create(
            title=f"Broadcast: {title}",
            description="Live stream broadcast from Control Tower.",
            week=4, 
            duration=30, 
            difficulty='advanced'
        )

        Resource.objects.create(
            module=module,
            title=title,
            type='video' if 'youtube' in url or 'vimeo' in url else 'url',
            url=url,
            order=0
        )

        return Response({"status": "Stream Uploaded", "module_id": module.id})

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all().order_by('week', 'id')
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

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
