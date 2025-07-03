from django.conf import settings
import requests

from portal.api.serializers.task import TaskNestedCommentsSerializer
from portal.cache.redis_client import RedisClient
from portal.llm.models import TaskSummary
from portal.workspace.models import Task

def generate_workspace_task_summary(task_id):
    task = Task.objects.get(id=task_id)
    [summary, created] = TaskSummary.objects.get_or_create(task=task)
    response = requests.post(f"{settings.PORTAL_LLM_URL}/workspace-task-summary", json=TaskNestedCommentsSerializer(task).data)
    summary.summary = response.json()['summary']
    summary.save()
    redis = RedisClient()
    key = f"/api/workspaces/{task.workspace.id}/tasks/{task_id}/summary/*/"
    redis.delete_timestamp(key)

