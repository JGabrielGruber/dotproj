from django.db.models.signals import post_save
from django.dispatch import receiver
from rq import Queue

from portal.llm.redis_client import redis

@receiver(post_save, sender='workspace.Task')
def queue_task_summary(sender, instance, **kwargs):
    queue = Queue('llm', connection=redis.get_con())
    queue.enqueue('portal.llm.tasks.generate_workspace_task_summary', str(instance.id))

@receiver(post_save, sender='workspace.TaskComment')
def queue_task_comment_summary(sender, instance, **kwargs):
    queue = Queue('llm', connection=redis.get_con())
    queue.enqueue('portal.llm.tasks.generate_workspace_task_summary', str(instance.task_id))
