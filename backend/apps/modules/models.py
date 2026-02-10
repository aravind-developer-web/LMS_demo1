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
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    priority = models.PositiveIntegerField(default=0)
    assignment_prompt = models.TextField(blank=True, null=True)
    has_quiz = models.BooleanField(default=False)
    has_assignment = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

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

class ModuleProgress(models.Model):
    STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='module_progress', on_delete=models.CASCADE)
    module = models.ForeignKey(Module, related_name='progress', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'module')

    def __str__(self):
        return f"{self.user.username} - {self.module.title} ({self.status})"

    def check_completion(self):
        """Principled completion check for the module."""
        from apps.quiz.models import QuizAttempt, Quiz
        from apps.assignments.models import Assignment, Submission
        from django.utils import timezone

        # 1. Check Resources
        total_resources = self.module.resources.count()
        completed_resources = ResourceProgress.objects.filter(
            user=self.user, 
            resource__module=self.module, 
            completed=True
        ).count()
        
        resources_done = total_resources == 0 or completed_resources >= total_resources
        if not resources_done: return False

        # 2. Check Quiz
        if self.module.has_quiz:
            quiz = Quiz.objects.filter(module=self.module).first()
            if not quiz: return False # Config error
            if not QuizAttempt.objects.filter(user=self.user, quiz=quiz, passed=True).exists():
                return False

        # 3. Check Assignment
        if self.module.has_assignment:
            assignment = Assignment.objects.filter(user=self.user, module=self.module).first()
            if not assignment: return False
            if not Submission.objects.filter(assignment=assignment).exists():
                return False

        # All met
        if self.status != 'completed':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            # Sync with Assignment model if exists (auto-enrolled learners too)
            Assignment.objects.filter(user=self.user, module=self.module).update(
                status='completed', completed_at=timezone.now()
            )
        return True

class ResourceProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='resource_progress', on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, related_name='progress', on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    watch_time_seconds = models.IntegerField(default=0)  # Total time watched
    last_position_seconds = models.IntegerField(default=0)  # Resume position
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} - {self.resource.title}"
