import uuid
from django.db import models

from portal.auth.models import User
from portal.workspace.models.workspace import Workspace

class WorkspaceFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name='files'
    )
    file_key = models.CharField(max_length=255)  # MinIO object path
    file_name = models.CharField(max_length=255)  # Original file name
    content_type = models.CharField(max_length=100)  # MIME type
    file_size = models.BigIntegerField()  # Size in bytes
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='uploaded_files'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace']),
            models.Index(fields=['id']),
        ]

    def __str__(self):
        return f"{self.file_name} in {self.workspace.label}"
