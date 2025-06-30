import django
from django.core.management.base import BaseCommand
from rq import Worker

django.setup()

from portal.cron.redis_client import redis

class Command(BaseCommand):
    help = 'Run RQ worker for workspace'

    def handle(self, *args, **kargs):
        worker = Worker(
            queues=['default', 'workspace-scheduler', 'workspace-chore', 'workspace-assigned'],
            connection=redis.get_con(),
        )
        try:
            print("Starting worker...")
            worker.work(with_scheduler=True)
        except KeyboardInterrupt:
            print("Shutting down worker...")

