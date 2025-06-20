from rest_framework import serializers
from portal.auth.models import User
from portal.workspace.models import (
    Category,
    Chore, ChoreAssigned, ChoreAssignmentSubmission, ChoreResponsible,
    Organization, OrganizationMember,
    Stage,
    Task, TaskComment, TaskCommentFile,
    Workspace, WorkspaceMember, WorkspaceInvite,
)
from portal.storage.models import WorkspaceFile

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
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(), required=False)

    class Meta:
        model = Workspace
        fields = ['id', 'label', 'organization']
        read_only_fields = ['id']

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceMember
        fields = ['id', 'workspace', 'user', 'role', 'name']
        read_only_fields = ['id', 'user', 'workspace', 'name']

    def get_name(self, object):
        return str(object.user)

class WorkspaceInviteSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())
    expires_at = serializers.DateTimeField(required=False)
    invite_url = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceInvite
        fields = ['id', 'token', 'role', 'created_at', 'expires_at', 'invite_url', 'workspace']
        read_only_fields = ['id', 'role', 'token', 'created_at', 'expires_at', 'invite_url', 'workspace']

    def get_invite_url(self, obj):
        return f"{self.context['request'].build_absolute_uri('/invite/')}{obj.token}/accept/"

class WorkspaceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceFile
        fields = ['id', 'file_name', 'content_type', 'file_size', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())

    class Meta:
        model = Category
        fields = ['id', 'label', 'emoji', 'key', 'workspace']
        read_only_fields = ['id', 'key', 'workspace']

class StageSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())

    class Meta:
        model = Stage
        fields = ['id', 'label', 'key', 'workspace']
        read_only_fields = ['id', 'key', 'workspace']

class TaskSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())
    category = serializers.CharField(source='category_key', allow_null=True, required=False)
    stage = serializers.CharField(source='stage_key', allow_null=True, required=False)
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'workspace', 'category', 'category_key', 'stage', 'stage_key', 'owner']
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
    category = serializers.CharField(source='category_key', allow_null=True, required=False)

    class Meta:
        model = Chore
        fields = ['id', 'title', 'description', 'recurrence', 'created_at', 'updated_at', 'workspace_key', 'category', 'category_key']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace', 'category']

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

# --- Re-usable Nested Serializers ---

class NestedUserSerializer(serializers.ModelSerializer):
    """
    Concise serializer for User details, to be nested
    """
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name']

    def get_name(self, object):
        return str(object)

class NestedCategorySerializer(serializers.ModelSerializer):
    """
    Concise serializer for Category details, to be nested.
    """
    class Meta:
        model = Category
        fields = ['id', 'label', 'emoji', 'key'] # Only include essential category info

class NestedStageSerializer(serializers.ModelSerializer):
    """
    Concise serializer for Stage details, to be nested within Task.
    """
    class Meta:
        model = Stage
        fields = ['id', 'label', 'key'] # Essential stage info

class NestedTaskFilesSerializer(serializers.ModelSerializer):
    """
    Concise serializer for TaskComment, nested within DetailedTaskSerializer.
    Shows the author and content of the comment.
    """
    owner = serializers.StringRelatedField() # Displays the __str__ of the User object
    file = serializers.PrimaryKeyRelatedField(read_only=True)
    content_type = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskCommentFile
        fields = ['id', 'owner', 'file', 'content_type', 'file_name', 'created_at']
        read_only_fields = ['id', 'owner', 'file', 'created_at']

    def get_content_type(self, obj):
        if obj.file:
            return obj.file.content_type

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.file_name

class NestedTaskCommentSerializer(serializers.ModelSerializer):
    """
    Concise serializer for TaskComment, nested within DetailedTaskSerializer.
    Shows the author and content of the comment.
    """
    author = serializers.StringRelatedField() # Displays the __str__ of the User object
    files = NestedTaskFilesSerializer(many=True, read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'author', 'content', 'files', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'files', 'created_at', 'updated_at']

class NestedChoreSerializer(serializers.ModelSerializer):
    """
    Concise serializer for Chore details, to be nested within ChoreAssigned.
    Includes the nested category.
    """
    category = NestedCategorySerializer(read_only=True) # Nested category details

    class Meta:
        model = Chore
        fields = ['id', 'title', 'description', 'recurrence', 'category', 'category_key']
        read_only_fields = ['id', 'category', 'category_key']

class NestedChoreAssignmentSubmissionSerializer(serializers.ModelSerializer):
    """
    Concise serializer for ChoreAssignmentSubmission, nested within ChoreAssigned.
    Shows the user who made the submission and relevant status/notes.
    """
    user = serializers.StringRelatedField() # Displays the __str__ of the User object

    class Meta:
        model = ChoreAssignmentSubmission
        fields = ['id', 'user', 'status', 'notes', 'submitted_at', 'updated_at']
        read_only_fields = ['id', 'user', 'submitted_at', 'updated_at']

class TaskDetailedSerializer(serializers.ModelSerializer):
    """
    Custom serializer to represent a Task with all its related details:
    - Basic task information
    - Category details
    - Stage details
    - Task owner (user)
    - List of task comments
    """
    workspace = serializers.StringRelatedField() # Display workspace name
    category = NestedCategorySerializer(read_only=True) # Nested category details
    stage = NestedStageSerializer(read_only=True) # Nested stage details
    owner = NestedUserSerializer(read_only=True) # Nested user details
    comments = NestedTaskCommentSerializer(many=True, read_only=True)
    comment_files = NestedTaskFilesSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'created_at', 'updated_at',
            'workspace', 'category', 'category_key', 'stage', 'stage_key', 'owner', 'comments',
            'comment_files',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'workspace',
            'category', 'category_key', 'stage', 'stage_key', 'owner', 'comments',
            'comment_files',
        ]

class ChoreAssignmentDetailedSerializer(serializers.ModelSerializer):
    """
    Custom serializer for ChoreAssigned entries, providing a comprehensive
    view for the user, including full chore details and all submissions.
    """
    chore = NestedChoreSerializer(read_only=True) # Nested Chore details
    user = serializers.StringRelatedField() # The user who is assigned this specific chore assignment
    submissions = NestedChoreAssignmentSubmissionSerializer(many=True, read_only=True)

    class Meta:
        model = ChoreAssigned
        fields = [
            'id', 'chore', 'user', 'status', 'closed',
            'assigned_at', 'updated_at', 'submissions'
        ]
        read_only_fields = [
            'id', 'chore', 'user', 'closed',
            'assigned_at', 'updated_at', 'submissions'
        ]
