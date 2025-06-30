import django
from django.core.management.base import BaseCommand
from redis import Redis
from rq import Worker

django.setup()

class Command(BaseCommand):
    help = 'Run RQ worker for workspace'

    def handle(self, *args, **kargs):
        worker = Worker(
            queues=['default', 'workspace-scheduler', 'workspace-chore', 'workspace-assigned'],
            connection=Redis(db=1)
        )
        try:
            print("Starting worker...")
            worker.work(with_scheduler=True)
        except KeyboardInterrupt:
            print("Shutting down worker...")

