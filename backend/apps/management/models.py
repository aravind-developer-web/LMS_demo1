from django.db import models
from django.conf import settings
from apps.modules.models import Module

class Certification(models.Model):
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='certifications', on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return f"Cert: {self.learner.username} - {self.module.title}"

class ManagerNotice(models.Model):
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notices', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    external_link = models.URLField(blank=True, null=True)
    is_alert = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class LearnerMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Msg from {self.sender.username} to {self.receiver.username}"

class Broadcast(models.Model):
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='broadcasts', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    is_video = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
