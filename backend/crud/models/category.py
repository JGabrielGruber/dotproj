import uuid
from django.db import models
from django.utils.text import slugify

from crud.models import workspace

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=255)
    emoji = models.CharField(max_length=1, default='')
    key = models.CharField(max_length=255, blank=True)
    workspace = models.ForeignKey(workspace.Workspace, on_delete=models.CASCADE, related_name='categories')

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'key']),
        ]

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = slugify(self.label)[:255]  # Simplify label to key
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.emoji} {self.label} - ({self.workspace.name})"
