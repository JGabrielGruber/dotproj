from django.db import models
from uuid import uuid4

from portal.auth.models import User
from portal.workspace.models.workspace import Workspace


class Form(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    fields = models.JSONField()
    category_key = models.CharField(max_length=255, blank=True, null=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='forms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace',]),
            models.Index(fields=['workspace', 'category_key',]),
        ]

    def __str__(self):
        return self.title


class FormSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='submissions')
    data = models.JSONField()
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='form_submissions')
    submitter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='form_submissions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace',]),
            models.Index(fields=['workspace', 'form',]),
        ]

    def __str__(self):
        return f"{self.form.title} - {self.created_at}"

