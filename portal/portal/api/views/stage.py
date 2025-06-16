import logging
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Stage
from portal.api.serializers import StageSerializer

logger = logging.getLogger(__name__)

class StageViewSet(ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer

    def get_queryset(self):
        queryset = Stage.objects.all()
        ws_id = self.kwargs['ws_pk']
        return queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating stage in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

