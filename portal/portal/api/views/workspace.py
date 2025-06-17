import logging
from django.db import connection
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Workspace, WorkspaceMember, WorkspaceInvite, Organization
from portal.api.serializers import WorkspaceSerializer, WorkspaceMemberSerializer, WorkspaceInviteSerializer

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

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating member {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting member {instance.id}")
        instance.delete()


class WorkspaceInviteViewSet(ModelViewSet):
    queryset = WorkspaceInvite.objects.all()
    serializer_class = WorkspaceInviteSerializer


    def get_queryset(self):
        queryset = WorkspaceInvite.objects.all()
        ws_id = self.kwargs.get('ws_pk')
        if ws_id:
            return queryset.filter(workspace_id=ws_id)
        return queryset

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating invite to workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])


class AcceptInviteViewSet(APIView):
    def get(self, request, token):
        logger.info(f"User {request.user.username} attempting to accept invite {token}")
        try:
            with connection.cursor() as cursor:
                cursor.execute('SET ROLE postgres')
            invite = WorkspaceInvite.objects.get(token=token)
            if not invite.is_valid():
                logger.warning(f"Invite {token} expired")
                return Response({'error': 'Invite expired'}, status=400)
            if WorkspaceMember.objects.filter(workspace=invite.workspace, user=request.user).exists():
                logger.info(f"User {self.request.user.username} already a member of workspace {invite.workspace.id}")
                return Response({'message': 'Already a member', 'workspace_id': str(invite.workspace.id)}, status=200)
            wm = WorkspaceMember.objects.create(
                workspace=invite.workspace,
                user=request.user,
                role=invite.role
            )
            wm.save()
            logger.info(f"User {self.request.user.username} joined workspace {invite.workspace.id} as {invite.role}")
            return Response({
                'message': 'Joined workspace',
                'workspace_id': str(invite.workspace.id),
            })
        except WorkspaceInvite.DoesNotExist:
            logger.error(f"Invalid invite token {token}")
            return Response({'error': 'Invalid invite'}, status=400)
