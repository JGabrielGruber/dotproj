import logging
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from portal.workspace.models import Chore, ChoreResponsible, ChoreAssigned, ChoreAssignmentSubmission
from portal.api.serializers import (
    ChoreSerializer, ChoreResponsibleSerializer,
    ChoreAssignedSerializer, ChoreAssignmentSubmissionSerializer,
    ChoreAssignmentDetailedSerializer
)

logger = logging.getLogger(__name__)

class ChoreViewSet(ModelViewSet):
    queryset = Chore.objects.all()
    serializer_class = ChoreSerializer

    def get_queryset(self):
        queryset = Chore.objects.all()
        ws_id = self.kwargs['ws_pk']
        return queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating chore in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating chore {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting chore {instance.id}")
        instance.delete()

class ChoreResponsibleViewSet(ModelViewSet):
    queryset = ChoreResponsible.objects.all()
    serializer_class = ChoreResponsibleSerializer

    def get_queryset(self):
        queryset = ChoreResponsible.objects.all()
        chore_id = self.kwargs['chore_pk']
        return queryset.filter(chore_id=chore_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding responsible to chore {self.kwargs['chore_pk']}")
        serializer.save(chore_id=self.kwargs['chore_pk'])

class ChoreAssignedViewSet(ModelViewSet):
    queryset = ChoreAssigned.objects.all()
    serializer_class = ChoreAssignedSerializer

    def get_queryset(self):
        queryset = ChoreAssigned.objects.all()
        chore_id = self.kwargs.get('chore_pk', None)
        if chore_id:
            return queryset.filter(chore_id=chore_id)
        return queryset

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} assigning user to chore {self.kwargs['chore_pk']}")
        serializer.save(chore_id=self.kwargs['chore_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating chore assignment {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting chore assignment {instance.id}")
        instance.delete()

class ChoreAssignmentSubmissionViewSet(ModelViewSet):
    queryset = ChoreAssignmentSubmission.objects.all()
    serializer_class = ChoreAssignmentSubmissionSerializer

    def get_queryset(self):
        queryset = ChoreAssignmentSubmission.objects.all()
        assigned_id = self.kwargs['assigned_pk']
        return queryset.filter(chore_assigned_id=assigned_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} submitting to chore assignment {self.kwargs['assigned_pk']}")
        serializer.save(chore_assigned_id=self.kwargs['assigned_pk'], user=self.request.user)


class ChoreAssignmentDetailedViewSet(ReadOnlyModelViewSet):
    """
    A ViewSet for viewing detailed ChoreAssignment instances.
    This viewset provides read-only operations (list, retrieve)
    for ChoreAssigned objects, exposing them with the detailed
    ChoreAssignmentDetailedSerializer.

    RLS (Row-Level Security) is expected to handle access control
    at the database level, ensuring users only see assignments they are
    authorized for (e.g., related to their workspaces or assignments).
    """
    queryset = ChoreAssigned.objects.all()
    serializer_class = ChoreAssignmentDetailedSerializer

    def get_queryset(self):
        queryset = ChoreAssigned.objects.all()
        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            queryset = queryset.filter(workspace_id=ws_id)
        return queryset.filter(closed=False)
