from rest_framework import serializers
from .models import Assignment, Submission

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'content', 'submitted_at', 'status', 'feedback', 'grade']
        read_only_fields = ['submitted_at', 'status', 'feedback', 'grade', 'assignment']

class AssignmentSerializer(serializers.ModelSerializer):
    module_title = serializers.ReadOnlyField(source='module.title')
    has_quiz = serializers.ReadOnlyField(source='module.has_quiz')
    has_assignment = serializers.ReadOnlyField(source='module.has_assignment')
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.username')

    class Meta:
        model = Assignment
        fields = '__all__'
