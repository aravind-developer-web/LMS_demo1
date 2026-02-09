from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Discussion, Reply
from .serializers import DiscussionSerializer, ReplySerializer
from apps.modules.models import Module

class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Discussion.objects.all()
        module_id = self.request.query_params.get('module_id')
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset

    def perform_create(self, serializer):
        module_id = self.request.data.get('module_id')
        module = get_object_or_404(Module, id=module_id)
        serializer.save(user=self.request.user, module=module)

class ReplyViewSet(viewsets.ModelViewSet):
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Reply.objects.all()
        discussion_id = self.request.query_params.get('discussion_id')
        if discussion_id:
            queryset = queryset.filter(discussion_id=discussion_id)
        return queryset

    def perform_create(self, serializer):
        discussion_id = self.request.data.get('discussion_id')
        discussion = get_object_or_404(Discussion, id=discussion_id)
        serializer.save(user=self.request.user, discussion=discussion)
