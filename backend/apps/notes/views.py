from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
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
        # Check if note exists
        note, created = Note.objects.update_or_create(
            user=self.request.user,
            module=module,
            defaults={'content': serializer.validated_data.get('content', '')}
        )

class ModuleNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, module_id):
        module = get_object_or_404(Module, pk=module_id)
        note, created = Note.objects.get_or_create(user=request.user, module=module)
        return Response(NoteSerializer(note).data)

    def post(self, request, module_id):
        module = get_object_or_404(Module, pk=module_id)
        content = request.data.get('content', '')
        note, created = Note.objects.update_or_create(
            user=request.user,
            module=module,
            defaults={'content': content}
        )
        return Response(NoteSerializer(note).data)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
