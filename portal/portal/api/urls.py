from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from portal.api.views.task import TaskDetailedViewSet
from .views import (
    OrganizationViewSet, OrganizationMemberViewSet,
    WorkspaceViewSet, WorkspaceMemberViewSet,
    CategoryViewSet, StageViewSet,
    TaskViewSet, TaskCommentViewSet,
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
workspace_router.register(r'tasks', TaskDetailedViewSet, basename='task')
workspace_router.register(r'chores', ChoreAssignmentDetailedViewSet, basename='chore-assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(org_router.urls)),
    path('', include(ws_router.urls)),
    path('', include(task_router.urls)),
    path('', include(chore_router.urls)),
    path('', include(assigned_router.urls)),
    path('', include(workspace_router.urls)),
]
