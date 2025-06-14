import uuid
from django.contrib.auth.models import User
from django.db import models


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class OrganizationMember(models.Model):
    class RoleChoices(models.TextChoices):
        OWNER = 'owner', 'Owner'
        MANAGER = 'manager', 'Manager'
        USER = 'user', 'User'
        VIEWER = 'viewer', 'Viewer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='organization_memberships')
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.VIEWER)

    class Meta:
        indexes = [
            models.Index(fields=['organization', 'user']),
            models.Index(fields=['role']),
        ]
        unique_together = ['organization', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.role} in {self.organization.name}"
