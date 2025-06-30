from croniter import croniter
from datetime import datetime
from rq import Queue

from portal.workspace.models import Workspace, Chore, ChoreResponsible, ChoreAssigned
from portal.cron.redis_client import redis

def schedule_chores_jobs():
    queue = Queue(name='workspace-chore', connection=redis.get_con())
    jobs = []
    for workspace in Workspace.objects.all():
        job_id = f"schedule-chores-jobs.{workspace.id}"
        jobs.append(
            Queue.prepare_data(
                manage_assignments_schedules,
                (workspace.id, ),
                job_id=job_id,
            )
        )
    queue.enqueue_many(jobs)

def manage_assignments_schedules(workspace_id):
    queue = Queue(name='workspace-assigned', connection=redis.get_con())
    for chore in Chore.objects.all().filter(workspace_id=workspace_id):
        for responsible in ChoreResponsible.objects.all().filter(chore_id=chore.id):
            try:
                now = datetime.now()
                cron = croniter(chore.schedule, now)
                next = cron.get_next(datetime)
                job_id = f"schedule-assignments-jobs.{chore.id}.{responsible.id}.{next.timestamp()}"
                queue.enqueue_at(
                    cron.get_next(datetime),
                    create_assignment,
                    workspace_id,
                    chore.id,
                    responsible.user.id,
                    job_id=job_id,
                )
            except Exception as e:
                print(e)

def create_assignment(workspace_id, chore_id, user_id):
    assignment = ChoreAssigned(workspace_id=workspace_id, chore_id=chore_id, user_id=user_id)
    assignment.save()
