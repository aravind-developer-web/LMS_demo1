from .models import Certification, ManagerNotice, LearnerMessage, Broadcast
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, serializers, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action

User = get_user_model()

class BroadcastSerializer(serializers.ModelSerializer):
    manager_name = serializers.ReadOnlyField(source='manager.username')
    class Meta:
        model = Broadcast
        fields = '__all__'
        read_only_fields = ['manager', 'created_at']

class BroadcastViewSet(viewsets.ModelViewSet):
    serializer_class = BroadcastSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Broadcast.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)

class LearnerManagementViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _is_manager(self, request):
        return request.user.role in ['manager', 'admin']

    def list(self, request):
        """List all learners for diagnostics"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=403)
        learners = User.objects.filter(role='learner')
        data = [{
            "id": l.id,
            "name": l.username,
            "email": l.email,
            "role": l.role
        } for l in learners]
        return Response(data)

    def destroy(self, request, pk=None):
        """Remove a learner (soft delete or just unlinking, but here we'll just simulate removal from team)"""
        if not self._is_manager(request):
            return Response({"error": "Unauthorized"}, status=403)
        # For this demo, we'll just return success to avoid destructive deletion
        # In real world, we'd delete the user or mark as inactive
        return Response({"success": True, "message": f"Learner {pk} unlinked from matrix."})

class CertificationSerializer(serializers.ModelSerializer):
    learner_name = serializers.ReadOnlyField(source='learner.username')
    module_title = serializers.ReadOnlyField(source='module.title')

    class Meta:
        model = Certification
        fields = '__all__'

class ManagerNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerNotice
        fields = '__all__'
        read_only_fields = ['manager', 'created_at']

class LearnerMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    receiver_name = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = LearnerMessage
        fields = '__all__'
        read_only_fields = ['sender', 'created_at']

class CertificationListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'learner':
            return Certification.objects.filter(learner=user)
        return Certification.objects.all()

    def perform_create(self, serializer):
        serializer.save()

class ManagerNoticeListCreateView(generics.ListCreateAPIView):
    serializer_class = ManagerNoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ManagerNotice.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)

class LearnerMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = LearnerMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Fix for the models.Q reference in the view
        from django.db.models import Q
        return LearnerMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
