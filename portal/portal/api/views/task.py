import logging
import uuid
from django.http import StreamingHttpResponse
from rest_framework.views import APIView, Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from portal.api.serializers.task import TaskFileSerializer, TaskSummarySerializer
from portal.workspace.models import Task, TaskComment, TaskCommentFile
from portal.api.serializers import (
    TaskCommentDetailedSerializer, TaskSerializer, TaskCommentSerializer,
    TaskDetailedSerializer,
)
from portal.storage.minio_client import get_minio_client
from portal.storage.models import WorkspaceFile
from portal.llm.models import TaskSummary

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
        ws_id = self.kwargs.get('ws_pk')
        logger.info(f"User {self.request.user.username} creating task in workspace {ws_id}")

        params = {}
        if ws_id:
            params['workspace_id'] = ws_id

        serializer.save(**params)

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


class TaskDetailedViewSet(TaskViewSet):
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

    def get_serializer_class(self):
        # Use TaskDetailedSerializer for list and retrieve, TaskSerializer for others
        if self.action in ['list', 'retrieve']:
            return TaskDetailedSerializer
        return TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()

        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            queryset = queryset.filter(workspace_id=ws_id)
        queryset = queryset.prefetch_related('comments')
        queryset = queryset.select_related('owner')
        queryset = queryset.order_by('-updated_at')
        return queryset


class TaskCommentDetailedViewSet(TaskCommentViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentDetailedSerializer

    def get_serializer_class(self):
        # Use TaskDetailedSerializer for list and retrieve, TaskSerializer for others
        if self.action in ['list', 'retrieve']:
            return TaskCommentDetailedSerializer
        return TaskCommentSerializer

    def get_queryset(self):
        queryset = TaskComment.objects.all()
        task_id = self.kwargs.get('task_pk', None)
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        queryset = queryset.order_by('-updated_at')
        return queryset

class TaskCommentFileViewSet(APIView):
    def post(self, request, task_id, *args, **kwargs):
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

        response_data = TaskCommentDetailedSerializer(comment).data
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


class TaskFileViewSet(ReadOnlyModelViewSet):
    """
    ViewSet to list TaskCommentFile entries per workspace, including file details,
    task title, task category, comment content, workspace, and owner.
    """
    queryset = TaskCommentFile.objects.all()
    serializer_class = TaskFileSerializer

    def get_queryset(self):
        ws_id = self.kwargs.get('ws_pk')
        queryset = TaskCommentFile.objects.filter(task__workspace_id=ws_id)
        queryset = queryset.select_related('file', 'task', 'comment', 'owner', 'task__workspace')
        queryset = queryset.order_by('-created_at')
        return queryset

class TaskSummaryViewSet(APIView):
    def get(self, request, task_id, *args, **kwargs):
        try:
            task = Task.objects.get(id=task_id)
            summary = TaskSummary.objects.get(task=task)
            return Response(TaskSummarySerializer(summary).data, status=200)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)
        except TaskSummary.DoesNotExist:
            return Response(None, status=204)
        except Exception as e:
            print(e)
            return Response({'error': f'Failed to fetch task summary: {str(e)}'}, status=500)

