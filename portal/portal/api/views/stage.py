import logging
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from portal.workspace.models import Stage, Workspace
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

    @action(detail=False, methods=['put'], url_path='upsert')
    def upsert(self, request, ws_pk):
        ws = Workspace.objects.get(id=ws_pk)
        items = request.data
        queryset = Stage.objects.all()

        stages = queryset.filter(workspace_id=ws.id)

        results = []
        for data in items:
            data['workspace'] = ws.id
            if 'id' in data:
                stage = stages.get(id=data['id'])
                serializer = StageSerializer(stage, data=data, partial=True)
            else:
                serializer = StageSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                results.append(serializer.data)
            else:
                return Response(serializer.errors, status=400)

        return Response(results, status=200)
