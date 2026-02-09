from rest_framework import serializers
from .models import Discussion, Reply
from apps.authapp.serializers import UserSerializer

class ReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'discussion', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'discussion']

class DiscussionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = ['id', 'module', 'user', 'title', 'content', 'created_at', 'replies', 'reply_count']
        read_only_fields = ['user', 'module']

    def get_reply_count(self, obj):
        return obj.replies.count()
