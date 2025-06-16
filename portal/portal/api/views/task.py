import logging
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Task, TaskComment
from portal.api.serializers import TaskSerializer, TaskCommentSerializer

logger = logging.getLogger(__name__)

class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        ws_id = self.kwargs['ws_pk']
        return queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating task in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

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
