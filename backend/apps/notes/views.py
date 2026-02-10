from rest_framework import generics, permissions, views, response
from .models import Note
from .serializers import NoteSerializer
from apps.modules.models import Module

class NoteRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        module_id = self.kwargs.get('module_id')
        module = generics.get_object_or_404(Module, id=module_id)
        # Use get_or_create to safely handle existing notes and avoid IntegrityErrors
        note, created = Note.objects.get_or_create(user=self.request.user, module=module)
        return note

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NoteListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all notes for current user that are not empty
        return Note.objects.filter(user=self.request.user).exclude(content='').order_by('-updated_at')
