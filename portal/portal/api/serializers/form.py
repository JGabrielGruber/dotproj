from uuid import UUID
from rest_framework import serializers
from portal.form.models import (
    Form, FormSubmission,
    Process, ProcessInstance,
)
from portal.workspace.models import (
    Workspace,
)


class FormSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())
    category = serializers.CharField(source='category_key', allow_null=True, required=False)

    class Meta:
        model = Form
        fields = ['id', 'title', 'description', 'fields', 'created_at', 'updated_at', 'workspace', 'category', 'category_key']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace']


class FormSubmissionSerializer(serializers.ModelSerializer):
    form = serializers.PrimaryKeyRelatedField(read_only=True)
    submitter = serializers.StringRelatedField(read_only=True)
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())

    class Meta:
        model = FormSubmission
        fields = ['id', 'form', 'submitter', 'data', 'created_at', 'updated_at', 'workspace']
        read_only_fields = ['id', 'form', 'submitter', 'created_at', 'updated_at']


class ProcessSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())
    category = serializers.CharField(source='category_key', allow_null=True, required=False)

    class Meta:
        model = Process
        fields = ['id', 'title', 'description', 'steps', 'created_at', 'updated_at', 'workspace', 'category', 'category_key']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace']


class ProcessInstanceSerializer(serializers.ModelSerializer):
    process = serializers.PrimaryKeyRelatedField(read_only=True)
    initiator = serializers.StringRelatedField(read_only=True)
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())

    class Meta:
        model = ProcessInstance
        fields = ['id', 'process', 'submitter', 'data', 'created_at', 'updated_at', 'workspace']
        read_only_fields = ['id', 'process', 'initiator', 'created_at', 'updated_at']


class FormNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = ['id', 'title', 'description', 'fields'] 
        read_only_fields = ['id', 'title', 'description', 'fields']


class ProcessStepsFieldSerializer(serializers.Field):
    def to_representation(self, value):
        if not value:
            return value

        form_ids = []
        for step in value.values():
            if isinstance(step, dict) and 'form' in step:
                try:
                    UUID(step['form'])  # Validate UUID
                    form_ids.append(step['form'])
                except (ValueError, TypeError):
                    continue

        forms = Form.objects.filter(id__in=form_ids)
        form_dict = {str(form.id): FormNestedSerializer(form).data for form in forms}

        result = value.copy()
        for step_key, step_data in result.items():
            if isinstance(step_data, dict) and 'form' in step_data:
                form_id = step_data['form']
                if form_id in form_dict:
                    step_data['form'] = form_dict[form_id]
                else:
                    step_data['form'] = None
        return result


class ProcessDetailedSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all())
    category = serializers.CharField(source='category_key', allow_null=True, required=False)
    steps = ProcessStepsFieldSerializer()

    class Meta:
        model = Process
        fields = ['id', 'title', 'description', 'steps', 'created_at', 'updated_at', 'workspace', 'category', 'category_key']
        read_only_fields = ['id', 'created_at', 'updated_at', 'workspace']
