import django
from django.core.management.base import BaseCommand
from rq.cron import CronScheduler

django.setup()

from portal.cron.redis_client import redis
from portal.cron.tasks.workspace import schedule_chores_jobs

class Command(BaseCommand):
    help = 'Run RQ scheduler for workspace'

    def handle(self, *args, **kargs):
        cron = CronScheduler(connection=redis.get_con())
        cron.register(
            schedule_chores_jobs,
            queue_name='workspace-scheduler',
            interval=60,
            meta={ "job_id": "foobar" },
        )
        try:
            print("Starting cron scheduler...")
            cron.start()
        except KeyboardInterrupt:
            print("Shutting down cron scheduler...")

