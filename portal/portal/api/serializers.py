from rest_framework import serializers
from portal.workspace.models import (
    Category,
    Chore, ChoreAssigned, ChoreAssignmentSubmission, ChoreResponsible,
    Organization, OrganizationMember,
    Stage,
    Task, TaskComment,
    Workspace, WorkspaceMember,
)

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name']
        read_only_fields = ['id']

class OrganizationMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Displays username
    organization = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ['id', 'organization', 'user', 'role']
        read_only_fields = ['id', 'user']

class WorkspaceSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'organization']
        read_only_fields = ['id']

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ['id', 'workspace', 'user', 'role']
        read_only_fields = ['id', 'user']

class CategorySerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'label', 'emoji', 'key', 'workspace']
        read_only_fields = ['id', 'key', 'workspace']

class StageSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Stage
        fields = ['id', 'label', 'key', 'workspace']
        read_only_fields = ['id', 'key', 'workspace']

class TaskSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True)
    stage = serializers.PrimaryKeyRelatedField(queryset=Stage.objects.all())
    owner = serializers.StringRelatedField(allow_null=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'workspace', 'category', 'stage', 'owner']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace']

class TaskCommentSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(read_only=True)
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'task', 'author', 'created_at', 'updated_at']

class ChoreSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True)

    class Meta:
        model = Chore
        fields = ['id', 'title', 'description', 'recurrence', 'created_at', 'updated_at', 'workspace', 'category']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace']

class ChoreResponsibleSerializer(serializers.ModelSerializer):
    chore = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = ChoreResponsible
        fields = ['id', 'chore', 'user']
        read_only_fields = ['id', 'chore']

class ChoreAssignedSerializer(serializers.ModelSerializer):
    chore = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = ChoreAssigned
        fields = ['id', 'chore', 'user', 'status', 'closed', 'assigned_at', 'updated_at']
        read_only_fields = ['id', 'chore', 'closed', 'assigned_at', 'updated_at']

class ChoreAssignmentSubmissionSerializer(serializers.ModelSerializer):
    chore_assigned = serializers.PrimaryKeyRelatedField(read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ChoreAssignmentSubmission
        fields = ['id', 'chore_assigned', 'user', 'status', 'notes', 'submitted_at', 'updated_at']
        read_only_fields = ['id', 'chore_assigned', 'user', 'submitted_at', 'updated_at']
