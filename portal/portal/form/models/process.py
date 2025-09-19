from django.db import models
from uuid import uuid4

from portal.auth.models import User
from portal.workspace.models.workspace import Workspace


class Process(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    steps = models.JSONField()
    category_key = models.CharField(max_length=255, blank=True, null=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='processes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace',]),
            models.Index(fields=['workspace', 'category_key',]),
        ]

    def __str__(self):
        return self.title


class ProcessInstance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='instances')
    data = models.JSONField()
    stage_key = models.CharField(max_length=255, blank=True, null=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='process_instances')
    initiator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='process_instances')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace',]),
            models.Index(fields=['workspace', 'process',]),
        ]

