from django.db import models
from django.conf import settings
from apps.modules.models import Module

class LearningSession(models.Model):
    """
    Tracks real time invested in a module.
    Anti-cheat mechanism: increments only when pinged by active client.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='learning_sessions', on_delete=models.CASCADE)
    module = models.ForeignKey(Module, related_name='sessions', on_delete=models.CASCADE)
    video_id = models.CharField(max_length=255, blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_ping_at = models.DateTimeField(auto_now=True)
    total_seconds = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('completed', 'Completed')], default='active')

    class Meta:
        ordering = ['-last_ping_at']

    def __str__(self):
        return f"{self.user.username} - {self.module.title} ({self.total_seconds}s)"

class VideoProgress(models.Model):
    """
    Tracks exact video browsing progress.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='video_progress', on_delete=models.CASCADE)
    video_id = models.CharField(max_length=255)
    module = models.ForeignKey(Module, related_name='video_status', on_delete=models.CASCADE)
    watched_seconds = models.FloatField(default=0.0)
    total_seconds = models.FloatField(default=0.0)
    completion_percent = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'video_id', 'module')

    def __str__(self):
        return f"{self.user.username} - {self.video_id}: {self.completion_percent}%"

class ActivityLog(models.Model):
    """
    Tracks granular learner activities for auditing.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='activity_logs', on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.action}"
