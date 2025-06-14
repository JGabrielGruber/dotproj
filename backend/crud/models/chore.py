import uuid
from django.db import models
from django.contrib.auth.models import User

from crud.models.category import Category
from crud.models.workspace import Workspace

class Chore(models.Model):
    class RecurrenceChoices(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKLY = 'weekly', 'Weekly'
        MONTHLY = 'monthly', 'Monthly'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='chores')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='chores')
    recurrence = models.CharField(max_length=20, choices=RecurrenceChoices.choices, default=RecurrenceChoices.WEEKLY)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace']),
            models.Index(fields=['recurrence']),
        ]

    def __str__(self):
        return f"{self.title} ({self.workspace.name})"

class ChoreResponsible(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chore = models.ForeignKey(Chore, on_delete=models.CASCADE, related_name='responsibles')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chore_responsibilities')

    class Meta:
        indexes = [
            models.Index(fields=['chore', 'user']),
        ]
        unique_together = ['chore', 'user']

    def __str__(self):
        return f"{self.user.username} responsible for {self.chore.title}"

class StatusChoices(models.TextChoices):
    PENDING = 'pending', 'Pending'
    DOING = 'doing', 'Doing'
    CANCELLED = 'cancelled', 'Cancelled'
    DONE = 'done', 'Done'

class ChoreAssigned(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chore = models.ForeignKey(
        Chore, on_delete=models.CASCADE, related_name='assignments')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='chore_assignments')
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    assigned_at = models.DateTimeField(auto_now_add=True)
    closed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['chore', 'user', 'status']),
            models.Index(fields=['assigned_at']),
            models.Index(fields=['chore', 'user', 'closed']),
        ]
        unique_together = ['chore', 'user', 'assigned_at']

    def save(self, *args, **kwargs):
        # Auto-set closed=True if status is done or cancelled
        if self.status in [StatusChoices.DONE, StatusChoices.CANCELLED]:
            self.closed = True
        else:
            self.closed = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} assigned {self.chore.title} - {self.status}"

class ChoreAssignedSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chore_assigned = models.ForeignKey(ChoreAssigned, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chore_submission_updates')
    status = models.CharField(max_length=20, choices=StatusChoices.choices)
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['chore_assigned', 'submitted_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.status} for {self.chore_assigned.chore.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update ChoreAssigned status to match latest submission
        self.chore_assigned.status = self.status
        self.chore_assigned.save(update_fields=['status', 'closed', 'updated_at'])
