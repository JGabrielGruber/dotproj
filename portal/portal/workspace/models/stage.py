import uuid
from django.db import models
from django.utils.text import slugify

from portal.workspace.models import workspace

class Stage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=255)
    key = models.CharField(max_length=255)
    workspace = models.ForeignKey(workspace.Workspace, on_delete=models.CASCADE, related_name='stages')

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'key']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['workspace', 'key'], name='unique_workspace_stage_key'),
        ]

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = slugify(self.label)[:255]  # Simplify label to key
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.label} - ({self.workspace.label})"

