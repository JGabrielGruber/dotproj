import logging
from rest_framework.viewsets import ModelViewSet

from portal.api.serializers.form import (
    FormSerializer, FormSubmissionSerializer,
    ProcessSerializer, ProcessInstanceSerializer, ProcessDetailedSerializer,
)
from portal.form.models import Form, FormSubmission, Process, ProcessInstance

logger = logging.getLogger(__name__)


class FormViewSet(ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer

    def get_queryset(self):
        queryset = Form.objects.all()
        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            return queryset.filter(workspace_id=ws_id)
        return queryset

    def perform_create(self, serializer):
        ws_id = self.kwargs.get('ws_pk')
        logger.info(f"User {self.request.user.username} creating form in workspace {ws_id}")

        params = {}
        if ws_id:
            params['workspace_id'] = ws_id

        serializer.save(**params)


class FormSubmissionViewSet(ModelViewSet):
    queryset = FormSubmission.objects.all()
    serializer_class = FormSubmissionSerializer

    def get_queryset(self):
        queryset = FormSubmission.objects.all()
        form_id = self.kwargs['form_pk']
        return queryset.filter(form_id=form_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} submiting on form {self.kwargs['form_pk']}")
        serializer.save(form_id=self.kwargs['form_pk'], author=self.request.user)


class ProcessViewSet(ModelViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessSerializer

    def get_queryset(self):
        queryset = Process.objects.all()
        ws_id = self.kwargs.get('ws_pk', None)
        if ws_id:
            return queryset.filter(workspace_id=ws_id)
        return queryset

    def perform_create(self, serializer):
        ws_id = self.kwargs.get('ws_pk')
        logger.info(f"User {self.request.user.username} creating process in workspace {ws_id}")

        params = {}
        if ws_id:
            params['workspace_id'] = ws_id

        serializer.save(**params)

class ProcessInstanceViewSet(ModelViewSet):
    queryset = ProcessInstance.objects.all()
    serializer_class = ProcessInstanceSerializer

    def get_queryset(self):
        queryset = ProcessInstance.objects.all()
        form_id = self.kwargs['form_pk']
        return queryset.filter(form_id=form_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} instanciated on process {self.kwargs['form_pk']}")
        serializer.save(form_id=self.kwargs['form_pk'], author=self.request.user)


class ProcessDetailedViewSet(ProcessViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessDetailedSerializer

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProcessDetailedSerializer
        return ProcessSerializer

