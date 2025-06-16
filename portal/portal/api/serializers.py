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

# --- Re-usable Nested Serializers ---

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

class NestedTaskCommentSerializer(serializers.ModelSerializer):
    """
    Concise serializer for TaskComment, nested within DetailedTaskSerializer.
    Shows the author and content of the comment.
    """
    author = serializers.StringRelatedField() # Displays the __str__ of the User object

    class Meta:
        model = TaskComment
        fields = ['id', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

class NestedChoreSerializer(serializers.ModelSerializer):
    """
    Concise serializer for Chore details, to be nested within ChoreAssigned.
    Includes the nested category.
    """
    category = NestedCategorySerializer(read_only=True) # Nested category details

    class Meta:
        model = Chore
        fields = ['id', 'title', 'description', 'recurrence', 'category']
        read_only_fields = ['id', 'category']

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
    owner = serializers.StringRelatedField(allow_null=True) # Displays the __str__ of the User object, allows null
    comments = NestedTaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'created_at', 'updated_at',
            'workspace', 'category', 'stage', 'owner', 'comments'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'workspace',
            'category', 'stage', 'owner', 'comments'
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
