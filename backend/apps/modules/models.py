from django.db import models
from django.conf import settings

class Module(models.Model):
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    video_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL to the module video (YouTube, Vimeo, etc.)")
    week = models.PositiveIntegerField(default=1, choices=[(i, f"Week {i}") for i in range(1, 5)])
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    assignment_prompt = models.TextField(blank=True, help_text="Instructions for the module assignment")
    priority = models.PositiveIntegerField(default=0)
    has_assignment = models.BooleanField(default=False)
    has_quiz = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['week', 'id']

class Resource(models.Model):
    TYPE_CHOICES = (
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('url', 'External URL'),
    )

    module = models.ForeignKey(Module, related_name='resources', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    url = models.URLField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} ({self.type})"
