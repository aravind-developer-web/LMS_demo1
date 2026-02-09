from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'user', 'module', 'module_title', 'content', 'created_at', 'updated_at']
        read_only_fields = ('user', 'module')
