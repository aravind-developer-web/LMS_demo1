from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from .models import Note
from .serializers import NoteSerializer
from apps.modules.models import Module

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        module_id = self.request.query_params.get('module')
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset

    def perform_create(self, serializer):
        module_id = self.request.data.get('module')
        module = get_object_or_404(Module, pk=module_id)
        serializer.save(user=self.request.user, module=module)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
