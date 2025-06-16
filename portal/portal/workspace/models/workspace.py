import uuid
from django.db import models

from portal.auth.models import User
from portal.workspace.models.organization import Organization


class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='workspaces')

    class Meta:
        indexes = [
            models.Index(fields=['label']),
        ]

    def __str__(self) -> str:
        return str(self.label)


class WorkspaceMember(models.Model):
    class RoleChoices(models.TextChoices):
        OWNER = 'owner', 'Owner'
        MANAGER = 'manager', 'Manager'
        USER = 'user', 'User'
        VIEWER = 'viewer', 'Viewer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='workspace_memberships')
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.VIEWER)

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'user']),
            models.Index(fields=['role']),
        ]
        unique_together = ['workspace', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.role} in {self.workspace.name}"
