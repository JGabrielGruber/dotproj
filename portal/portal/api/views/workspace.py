import logging
from django.http import request
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Workspace, WorkspaceMember, Organization
from portal.api.serializers import WorkspaceSerializer, WorkspaceMemberSerializer

logger = logging.getLogger(__name__)

class WorkspaceViewSet(ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        queryset = Workspace.objects.all()
        org_id = self.kwargs.get('org_pk', None)
        if org_id:
           return queryset.filter(organization_id=org_id)
        return queryset

    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_pk', None)
        user = self.request.user
        if not org_id:
            org = Organization.objects.first()
            if not org:
                org = Organization(name=user.username)
                org.save()
            org_id = org.id
        logger.info(f"User {user.username} creating workspace in organization {org_id}")
        serializer.save(organization_id=org_id)

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating workspace {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting workspace {instance.id}")
        instance.delete()


class WorkspaceMemberViewSet(ModelViewSet):
    queryset = WorkspaceMember.objects.all()
    serializer_class = WorkspaceMemberSerializer


    def get_queryset(self):
        queryset = WorkspaceMember.objects.all()
        ws_id = self.kwargs['ws_pk']
        return queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding member to workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])
