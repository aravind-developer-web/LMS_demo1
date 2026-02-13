from rest_framework import serializers
from .models import Module, Resource

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = '__all__'

class ResourceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ('title', 'description', 'type', 'url', 'order')
