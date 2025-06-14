from django.db.models.signals import post_save
from django.dispatch import receiver

from portal.workspace.middleware import get_current_user
from portal.workspace.models import Organization, Workspace, OrganizationMember, WorkspaceMember

@receiver(post_save, sender=Organization)
def create_organization_member(sender, instance, created, **kwargs):
    if created:
        user = get_current_user()
        if user and user.is_authenticated:
            OrganizationMember.objects.create(
                organization=instance,
                user=user,
                role='owner'
            )

@receiver(post_save, sender=Workspace)
def create_workspace_member(sender, instance, created, **kwargs):
    if created:
        user = get_current_user()
        if user and user.is_authenticated:
            WorkspaceMember.objects.create(
                workspace=instance,
                user=user,
                role='owner'
            )
