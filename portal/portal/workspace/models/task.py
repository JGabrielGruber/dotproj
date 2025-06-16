import uuid
from django.db import models

from portal.auth.models import User
from portal.workspace.models.category import Category
from portal.workspace.models.stage import Stage
from portal.workspace.models.workspace import Workspace

class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    stage_key = models.CharField(max_length=255, blank=True, null=True)
    category_key = models.CharField(max_length=255, blank=True, null=True)
    owner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_tasks')
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'stage_key']),
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        return f"{self.title} ({self.workspace.label})"

class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['task', 'created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"
