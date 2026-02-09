from rest_framework import serializers
from .models import Module, Resource, ModuleProgress, ResourceProgress

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'duration', 'difficulty', 'priority', 'resources', 'has_quiz', 'has_assignment', 'assignment_prompt']

class ResourceProgressSerializer(serializers.ModelSerializer):
    resource_id = serializers.IntegerField(source='resource.id', read_only=True)

    class Meta:
        model = ResourceProgress
        fields = ['id', 'resource_id', 'completed', 'completed_at', 'watch_time_seconds', 'last_position_seconds']

class ModuleProgressSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    resources_progress = serializers.SerializerMethodField()

    class Meta:
        model = ModuleProgress
        fields = ['id', 'module', 'module_title', 'status', 'started_at', 'completed_at', 'last_accessed', 'resources_progress']

    def get_resources_progress(self, obj):
        # Efficiently fetch resource progress for this user/module
        resources = obj.module.resources.all()
        progress = ResourceProgress.objects.filter(user=obj.user, resource__in=resources)
        return ResourceProgressSerializer(progress, many=True).data

class ResourceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'type', 'url', 'order']
