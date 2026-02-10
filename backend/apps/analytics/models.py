from django.db import models
from django.conf import settings

class LearningSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    focus_duration_seconds = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-start_time']

class ManagerAction(models.Model):
    ACTION_TYPES = (
        ('remind', 'Send Reminder'),
        ('flag', 'Flag Learner'),
        ('assign', 'Assign Module'),
        ('comment', 'Internal Comment'),
    )
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='actions_performed')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='actions_received')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
