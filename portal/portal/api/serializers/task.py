from rest_framework import serializers
from portal.auth.models import User
from portal.llm.models import TaskSummary
from portal.workspace.models import (
    Task, TaskComment, TaskCommentFile,
    Workspace,
)
from portal.api.serializers import (
    NestedCategorySerializer, NestedStageSerializer, NestedUserSerializer,
)

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

# --- Re-usable Nested Serializers ---

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
    author = serializers.StringRelatedField()

    class Meta:
        model = TaskComment
        fields = ['id', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

class TaskCommentDetailedSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField() # Displays the __str__ of the User object
    files = NestedTaskFilesSerializer(many=True, read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'author', 'content', 'files', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'files', 'created_at', 'updated_at']

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
    comment_files = NestedTaskFilesSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'created_at', 'updated_at',
            'workspace', 'category', 'category_key', 'stage', 'stage_key', 'owner',
            'comment_files',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'workspace',
            'category', 'category_key', 'stage', 'stage_key', 'owner',
            'comment_files',
        ]

class TaskFileSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()  # User’s __str__
    file = serializers.PrimaryKeyRelatedField(read_only=True)
    task = serializers.PrimaryKeyRelatedField(read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_category_key = serializers.CharField(source='task.category_key', read_only=True)
    comment_content = serializers.CharField(source='comment.content', read_only=True)
    workspace = serializers.StringRelatedField(source='task.workspace', read_only=True)
    content_type = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskCommentFile
        fields = [
            'id', 'owner', 'file', 'content_type', 'file_name', 'created_at',
            'task', 'task_title', 'task_category_key', 'comment_content', 'workspace'
        ]
        read_only_fields = [
            'id', 'owner', 'file', 'created_at', 'task', 'task_title', 'task_category_key',
            'comment_content', 'workspace',
        ]

    def get_content_type(self, obj):
        return obj.file.content_type if obj.file else None

    def get_file_name(self, obj):
        return obj.file.file_name if obj.file else None

class TaskNestedCommentsSerializer(serializers.ModelSerializer):
    comments = NestedTaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'comments']
        read_only_fields = ['id', 'title', 'description', 'created_at', 'comments']

class TaskSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSummary
        fields = ['id', 'summary', 'created_at', 'updated_at']
        read_only_fields = ['id', 'summary', 'created_at', 'updated_at']
