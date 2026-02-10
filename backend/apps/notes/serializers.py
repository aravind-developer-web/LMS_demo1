from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'user', 'module', 'module_title', 'content', 'created_at', 'updated_at']
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        """
        Create or update note (prevent duplicates).
        This is handled in the view, but included for completeness.
        """
        user = self.context['request'].user
        module = validated_data.get('module')
        content = validated_data.get('content', '')
        
        note, created = Note.objects.update_or_create(
            user=user,
            module=module,
            defaults={'content': content}
        )
        
        return note
