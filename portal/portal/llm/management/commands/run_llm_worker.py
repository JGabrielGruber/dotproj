import django
from django.core.management.base import BaseCommand
from rq import Worker

django.setup()

from portal.llm.redis_client import redis

class Command(BaseCommand):
    help = 'Run RQ worker for LLM'

    def handle(self, *args, **kargs):
        worker = Worker(
            queues=['llm'],
            connection=redis.get_con(),
        )
        try:
            print("Starting worker...")
            worker.work()
        except KeyboardInterrupt:
            print("Shutting down worker...")

