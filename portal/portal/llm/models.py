from django.db import models
import uuid

class TaskSummary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey('workspace.Task', on_delete=models.CASCADE, related_name='summaries')
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        indexes = [models.Index(fields=['task'])]
