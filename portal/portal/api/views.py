import logging
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from portal.workspace.models import (
    Category,
    Chore, ChoreAssigned, ChoreAssignmentSubmission, ChoreResponsible,
    Organization, OrganizationMember,
    Stage,
    Task, TaskComment,
    Workspace, WorkspaceMember,
)
from .serializers import (
    CategorySerializer,
    ChoreSerializer, ChoreAssignedSerializer, ChoreAssignmentSubmissionSerializer, ChoreResponsibleSerializer,
    OrganizationSerializer, OrganizationMemberSerializer,
    StageSerializer,
    TaskSerializer, TaskCommentSerializer,
    WorkspaceSerializer, WorkspaceMemberSerializer,
)

logger = logging.getLogger(__name__)

class OrganizationViewSet(ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating organization")
        serializer.save()

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating organization {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting organization {instance.id}")
        instance.delete()

class OrganizationMemberViewSet(ModelViewSet):
    queryset = OrganizationMember.objects.all()
    serializer_class = OrganizationMemberSerializer
    

    def get_queryset(self):
        org_id = self.kwargs['org_pk']
        return self.queryset.filter(organization_id=org_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding member to organization {self.kwargs['org_pk']}")
        serializer.save(organization_id=self.kwargs['org_pk'])

class WorkspaceViewSet(ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    

    def get_queryset(self):
        print(self.kwargs)
        org_id = self.kwargs['org_pk']
        return self.queryset.filter(organization_id=org_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating workspace in organization {self.kwargs['org_pk']}")
        serializer.save(organization_id=self.kwargs['org_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating workspace {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting workspace {instance.id}")
        instance.delete()

class WorkspaceMemberViewSet(ModelViewSet):
    queryset = WorkspaceMember.objects.all()
    serializer_class = WorkspaceMemberSerializer
    

    def get_queryset(self):
        ws_id = self.kwargs['ws_pk']
        return self.queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding member to workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    

    def get_queryset(self):
        ws_id = self.kwargs['ws_pk']
        return self.queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating category in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

class StageViewSet(ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    

    def get_queryset(self):
        ws_id = self.kwargs['ws_pk']
        return self.queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating stage in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    

    def get_queryset(self):
        ws_id = self.kwargs['ws_pk']
        return self.queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating task in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating task {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting task {instance.id}")
        instance.delete()

class TaskCommentViewSet(ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    

    def get_queryset(self):
        task_id = self.kwargs['task_pk']
        return self.queryset.filter(task_id=task_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} commenting on task {self.kwargs['task_pk']}")
        serializer.save(task_id=self.kwargs['task_pk'], author=self.request.user)

class ChoreViewSet(ModelViewSet):
    queryset = Chore.objects.all()
    serializer_class = ChoreSerializer
    

    def get_queryset(self):
        ws_id = self.kwargs['ws_pk']
        return self.queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating chore in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating chore {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting chore {instance.id}")
        instance.delete()

class ChoreResponsibleViewSet(ModelViewSet):
    queryset = ChoreResponsible.objects.all()
    serializer_class = ChoreResponsibleSerializer
    

    def get_queryset(self):
        chore_id = self.kwargs['chore_pk']
        return self.queryset.filter(chore_id=chore_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding responsible to chore {self.kwargs['chore_pk']}")
        serializer.save(chore_id=self.kwargs['chore_pk'])

class ChoreAssignedViewSet(ModelViewSet):
    queryset = ChoreAssigned.objects.all()
    serializer_class = ChoreAssignedSerializer
    

    def get_queryset(self):
        chore_id = self.kwargs['chore_pk']
        return self.queryset.filter(chore_id=chore_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} assigning user to chore {self.kwargs['chore_pk']}")
        serializer.save(chore_id=self.kwargs['chore_pk'])

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating chore assignment {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting chore assignment {instance.id}")
        instance.delete()

class ChoreAssignmentSubmissionViewSet(ModelViewSet):
    queryset = ChoreAssignmentSubmission.objects.all()
    serializer_class = ChoreAssignmentSubmissionSerializer
    

    def get_queryset(self):
        assigned_id = self.kwargs['assigned_pk']
        return self.queryset.filter(chore_assigned_id=assigned_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} submitting to chore assignment {self.kwargs['assigned_pk']}")
        serializer.save(chore_assigned_id=self.kwargs['assigned_pk'], user=self.request.user)
