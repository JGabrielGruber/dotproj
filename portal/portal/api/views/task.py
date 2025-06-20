import logging
import uuid
from django.conf import settings
from uuid import uuid4
from django.http import StreamingHttpResponse
from rest_framework.views import APIView, Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from portal.workspace.models import Task, TaskComment, TaskCommentFile
from portal.api.serializers import NestedTaskCommentSerializer, TaskSerializer, TaskCommentSerializer, TaskDetailedSerializer
from portal.storage.minio_client import get_minio_client
from portal.storage.models import WorkspaceFile

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

class TaskCommentFileViewSet(APIView):
    def post(self, request, task_id):
        file = request.FILES.get('file', None)
        content = request.data.get('content', '')
        owner_id = request.user.id

        task = Task.objects.get(id=task_id)

        # Create comment
        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_id=owner_id,
        )
        file_id = uuid.uuid4()

        if file:
            # Generate unique file key
            file_key = f"comments/{task_id}/{file_id}_{file.name}"
            print(f"Processing file: {file_key}")

            # Upload to MinIO
            minio_client = get_minio_client()
            try:
                minio_client.put_object(
                    Bucket='workspace-task-files',
                    Key=file_key,
                    Body=file.read(),
                    ContentType=file.content_type
                )
            except Exception as e:
                return Response({'error': f'MinIO upload failed: {str(e)}'}, status=500)

            # Create WorkspaceFile
            workspace_file = WorkspaceFile.objects.create(
                workspace=comment.task.workspace,
                file_key=file_key,
                file_name=file.name,
                content_type=file.content_type,
                file_size=file.size,
                created_by=request.user
            )
            # Create TaskCommentFile
            TaskCommentFile.objects.create(
                id=file_id,
                comment=comment,
                file=workspace_file,
                task=task,
                owner_id=owner_id,
            )

        response_data = NestedTaskCommentSerializer(comment).data
        return Response(response_data, status=201)

    def get(self, request, task_id, file_id, *args, **kwargs):
        try:
            task = Task.objects.get(id=task_id)

            file_obj = TaskCommentFile.objects.get(id=file_id)

            minio_client = get_minio_client()
            # Stream file from MinIO
            response = minio_client.get_object(
                Bucket='workspace-task-files',
                Key=file_obj.file.file_key,
            )

            content_type = file_obj.file.content_type or 'application/octet-stream'
            headers = {
                'Cache-Control': 'public, max-age=2592000',
                'ETag': f'"{file_id}"',
            }

            # Use inline for images, attachment for non-images
            if content_type.startswith('image/'):
                headers['Content-Disposition'] = f'inline; filename="{file_obj.file.file_name}"'
            else:
                headers['Content-Disposition'] = f'attachment; filename="{file_obj.file.file_name}"'

            return StreamingHttpResponse(
                response['Body'],
                content_type=content_type,
                headers=headers,
            )
        except TaskCommentFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)
        except Exception as e:
            print(e)
            return Response({'error': f'Failed to fetch file: {str(e)}'}, status=500)


