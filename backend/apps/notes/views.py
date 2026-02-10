from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta

from .models import Note
from .serializers import NoteSerializer
from apps.modules.models import Module, ModuleProgress
from apps.analytics.models import LearningSession


class NoteViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD API for Personal Notes with tracking integration.
    Notes are first-class telemetry signals.
    """
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get all notes for authenticated user"""
        return Note.objects.filter(user=self.request.user).select_related('module').order_by('-updated_at')

    def perform_create(self, serializer):
        """
        Create note and trigger tracking.
        Auto-creates note if doesn't exist for module.
        """
        module_id = self.request.data.get('module')
        
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            raise serializers.ValidationError({'module': 'Module not found'})
        
        # Get or create note (prevent duplicates)
        note, created = Note.objects.get_or_create(
            user=self.request.user,
            module=module,
            defaults={'content': self.request.data.get('content', '')}
        )
        
        if not created:
            # Update existing note
            note.content = self.request.data.get('content', '')
            note.save()
        
        # Trigger tracking telemetry
        self._track_note_activity(note, 'note_created' if created else 'note_updated')
        
        # Return the note instance for serialization
        return note

    def perform_update(self, serializer):
        """Update note and trigger tracking"""
        note = serializer.save()
        self._track_note_activity(note, 'note_updated')

    def perform_destroy(self, instance):
        """Delete note and trigger tracking"""
        self._track_note_activity(instance, 'note_deleted')
        instance.delete()

    def _track_note_activity(self, note, activity_type):
        """
        Track note activity as engagement signal.
        Updates learning session and module progress.
        """
        user = note.user
        module = note.module
        
        # Update or create learning session
        session, created = LearningSession.objects.get_or_create(
            user=user,
            module=module,
            defaults={
                'start_time': timezone.now(),
                'end_time': timezone.now()
            }
        )
        
        if not created:
            session.end_time = timezone.now()
            session.save()
        
        # Update module progress (notes are engagement signals, not completion signals)
        mod_progress, _ = ModuleProgress.objects.get_or_create(
            user=user,
            module=module
        )
        
        # Notes contribute to engagement but don't complete modules
        # This is tracked in analytics for manager visibility
        
        print(f"[Telemetry] Note activity tracked: {activity_type} for user {user.username} on module {module.title}")

    @action(detail=False, methods=['get'], url_path='by-module/(?P<module_id>[^/.]+)')
    def by_module(self, request, module_id=None):
        """Get note for a specific module (or create empty one)"""
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        
        note, created = Note.objects.get_or_create(
            user=request.user,
            module=module,
            defaults={'content': ''}
        )
        
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Get note summary statistics for the authenticated user"""
        user = request.user
        
        total_notes = Note.objects.filter(user=user).exclude(content='').count()
        notes_last_7d = Note.objects.filter(
            user=user,
            updated_at__gte=timezone.now() - timedelta(days=7)
        ).exclude(content='').count()
        
        modules_with_notes = Note.objects.filter(user=user).exclude(content='').values('module').distinct().count()
        
        return Response({
            'total_notes': total_notes,
            'notes_last_7d': notes_last_7d,
            'modules_with_notes': modules_with_notes,
            'last_updated': timezone.now().isoformat()
        })


class ManagerNoteAnalyticsViewSet(viewsets.ViewSet):
    """
    Manager-facing note analytics.
    Managers see engagement signals, NOT note content.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _is_manager(self, request):
        return request.user.is_staff or getattr(request.user, 'role', '') in ['manager', 'admin']

    @action(detail=False, methods=['get'], url_path='summary')
    def note_summary(self, request):
        """
        Get aggregated note engagement metrics.
        NO note content is exposed.
        """
        if not self._is_manager(request):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        # Active note takers (users with notes in last 7 days)
        active_note_takers = Note.objects.filter(
            updated_at__gte=last_7d
        ).exclude(content='').values('user').distinct().count()
        
        # Notes created/updated in last 24h
        notes_last_24h = Note.objects.filter(
            updated_at__gte=last_24h
        ).exclude(content='').count()
        
        # Total notes (non-empty)
        total_notes = Note.objects.exclude(content='').count()
        
        # Average notes per module
        modules_with_notes = Note.objects.exclude(content='').values('module').distinct().count()
        avg_notes_per_module = round(total_notes / modules_with_notes, 1) if modules_with_notes > 0 else 0
        
        # Top note-taking learners (by count, not content)
        top_learners = Note.objects.exclude(content='').values('user__username').annotate(
            note_count=Count('id')
        ).order_by('-note_count')[:5]
        
        return Response({
            'summary': {
                'active_note_takers': active_note_takers,
                'notes_last_24h': notes_last_24h,
                'total_notes': total_notes,
                'avg_notes_per_module': avg_notes_per_module
            },
            'top_learners': [
                {
                    'username': learner['user__username'],
                    'note_count': learner['note_count']
                } for learner in top_learners
            ],
            'computed_at': now.isoformat()
        })


# Legacy views for backward compatibility
from rest_framework import generics

class NoteRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        module_id = self.kwargs.get('module_id')
        module = generics.get_object_or_404(Module, id=module_id)
        note, created = Note.objects.get_or_create(user=self.request.user, module=module)
        return note

    def perform_update(self, serializer):
        note = serializer.save(user=self.request.user)
        
        # Track note activity
        session, _ = LearningSession.objects.get_or_create(
            user=self.request.user,
            module=note.module,
            defaults={'start_time': timezone.now(), 'end_time': timezone.now()}
        )
        session.end_time = timezone.now()
        session.save()

class NoteListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).exclude(content='').order_by('-updated_at')
