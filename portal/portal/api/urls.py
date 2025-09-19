from django.db.models import lookups
from django.urls import path, include
from portal.api.views.chore import ChoreDetailedViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from portal.api.views.task import TaskCommentDetailedViewSet, TaskCommentFileViewSet, TaskDetailedViewSet, TaskSummaryViewSet
from portal.api.views.form import FormViewSet, FormSubmissionViewSet, ProcessViewSet, ProcessInstanceViewSet, ProcessDetailedViewSet
from .views import (
    OrganizationViewSet, OrganizationMemberViewSet,
    WorkspaceViewSet, WorkspaceMemberViewSet, WorkspaceInviteViewSet, AcceptInviteViewSet,
    CategoryViewSet, StageViewSet,
    TaskViewSet, TaskCommentViewSet, TaskFileViewSet,
    ChoreViewSet, ChoreResponsibleViewSet, ChoreAssignedViewSet, ChoreAssignmentSubmissionViewSet, ChoreAssignmentDetailedViewSet,
)

# Root router
router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')

# Organization-level router
org_router = routers.NestedSimpleRouter(router, r'organizations', lookup='org')
org_router.register(r'members', OrganizationMemberViewSet, basename='organization-member')
org_router.register(r'workspaces', WorkspaceViewSet, basename='workspace')

# Workspace-level router
ws_router = routers.NestedSimpleRouter(org_router, r'workspaces', lookup='ws')
ws_router.register(r'members', WorkspaceMemberViewSet, basename='workspace-member')
ws_router.register(r'invites', WorkspaceInviteViewSet, basename='workspace-invite')
ws_router.register(r'categories', CategoryViewSet, basename='category')
ws_router.register(r'stages', StageViewSet, basename='stage')
ws_router.register(r'tasks', TaskViewSet, basename='task')
ws_router.register(r'chores', ChoreViewSet, basename='chore')

# Task-level router
task_router = routers.NestedSimpleRouter(ws_router, r'tasks', lookup='task')
task_router.register(r'comments', TaskCommentViewSet, basename='task-comment')

# Chore-level router
chore_router = routers.NestedSimpleRouter(ws_router, r'chores', lookup='chore')
chore_router.register(r'responsibles', ChoreResponsibleViewSet, basename='chore-responsible')
chore_router.register(r'assigned', ChoreAssignedViewSet, basename='chore-assigned')

# ChoreAssigned-level router
assigned_router = routers.NestedSimpleRouter(chore_router, r'assigned', lookup='assigned')
assigned_router.register(r'submissions', ChoreAssignmentSubmissionViewSet, basename='chore-assignment-submission')

router.register(r'workspaces', WorkspaceViewSet, basename='worskpace')

workspace_router = routers.NestedSimpleRouter(router, r'workspaces', lookup='ws')
workspace_router.register(r'categories', CategoryViewSet, basename='category')
workspace_router.register(r'stages', StageViewSet, basename='stage')
workspace_router.register(r'members', WorkspaceMemberViewSet, basename='workspace-member')
workspace_router.register(r'invites', WorkspaceInviteViewSet, basename='workspace-invite')

workspace_router.register(r'tasks', TaskDetailedViewSet, basename='task')

task_comment_router = routers.NestedSimpleRouter(workspace_router, r'tasks', lookup='task')
task_comment_router.register(r'comments', TaskCommentDetailedViewSet, basename='task-comment')

workspace_router.register(r'task-files', TaskFileViewSet, basename='task-file')

workspace_router.register(r'assignments', ChoreAssignmentDetailedViewSet, basename='chore-assignment')
workspace_router.register(r'chores', ChoreDetailedViewSet, basename='chore')

chore_responsible_router = routers.NestedSimpleRouter(workspace_router, r'chores', lookup='chore')
chore_responsible_router.register(r'responsibles', ChoreResponsibleViewSet, basename='chore-responsible')

workspace_router.register(r'forms', FormViewSet, basename='form')

form_router = routers.NestedSimpleRouter(workspace_router, r'forms', lookup='form')
form_router.register(r'submissions', FormSubmissionViewSet, basename='submission')

workspace_router.register(r'processes', ProcessDetailedViewSet, basename='process')

process_router = routers.NestedSimpleRouter(workspace_router, r'processes', lookup='process')
process_router.register(r'instances', ProcessInstanceViewSet, basename='instance')

router.register(r'tasks', TaskViewSet, basename='task')

tasks_router = routers.NestedSimpleRouter(router, r'tasks', lookup='task')
tasks_router.register(r'comments', TaskCommentViewSet, basename='comment')

urlpatterns = [
    path('invite/<uuid:token>/accept/', AcceptInviteViewSet.as_view(), name='accept-invite'),
    path('workspaces/<uuid:ws_id>/tasks/<uuid:task_id>/comments/upload', TaskCommentFileViewSet.as_view(), name='task-file-upload'),
    path('workspaces/<uuid:ws_id>/tasks/<uuid:task_id>/summary', TaskSummaryViewSet.as_view(), name='task-summary'),
    path('tasks/<uuid:task_id>/files/<uuid:file_id>', TaskCommentFileViewSet.as_view(), name='task-file-download'),
    path('tasks/<uuid:task_id>/files/<uuid:file_id>/<file_name>', TaskCommentFileViewSet.as_view(), name='task-file-download'),
    path('', include(router.urls)),
    path('', include(org_router.urls)),
    path('', include(ws_router.urls)),
    path('', include(task_router.urls)),
    path('', include(chore_router.urls)),
    path('', include(assigned_router.urls)),
    path('', include(workspace_router.urls)),
    path('', include(tasks_router.urls)),
    path('', include(task_comment_router.urls)),
    path('', include(chore_responsible_router.urls)),
]
