import logging
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from portal.workspace.models import Task, TaskComment
from portal.api.serializers import TaskSerializer, TaskCommentSerializer, TaskDetailedSerializer

logger = logging.getLogger(__name__)

class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            return queryset.filter(workspace_id=ws_id)
        return queryset

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating task in workspace {self.kwargs.get('ws_pk')}")
        serializer.save()

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating task {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting task {instance.id}")
        instance.delete()

class TaskCommentViewSet(ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer

    def get_queryset(self):
        queryset = TaskComment.objects.all()
        task_id = self.kwargs['task_pk']
        return queryset.filter(task_id=task_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} commenting on task {self.kwargs['task_pk']}")
        serializer.save(task_id=self.kwargs['task_pk'], author=self.request.user)


class TaskDetailedViewSet(ReadOnlyModelViewSet):
    """
    A ViewSet for viewing detailed Task instances.
    This viewset provides read-only operations (list, retrieve)
    for ChoreAssigned objects, exposing them with the detailed
    TaskDetailedSerializer.

    RLS (Row-Level Security) is expected to handle access control
    at the database level, ensuring users only see assignments they are
    authorized for (e.g., related to their workspaces or assignments).
    """
    queryset = Task.objects.all()
    serializer_class = TaskDetailedSerializer

    def get_queryset(self):
        queryset = Task.objects.all()

        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            queryset = queryset.filter(workspace_id=ws_id)
        queryset = queryset.prefetch_related('comments')
        queryset = queryset.select_related('owner')
        return queryset
