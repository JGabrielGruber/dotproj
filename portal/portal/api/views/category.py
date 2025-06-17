import logging
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Category, Workspace
from portal.api.serializers import CategorySerializer

logger = logging.getLogger(__name__)

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = Category.objects.all()
        ws_id = self.kwargs['ws_pk']
        return queryset.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating category in workspace {self.kwargs['ws_pk']}")
        serializer.save(workspace_id=self.kwargs['ws_pk'])

    @action(detail=False, methods=['put'], url_path='upsert')
    def upsert(self, request, ws_pk):
        ws = Workspace.objects.get(id=ws_pk)
        items = request.data
        queryset = Category.objects.all()

        categories = queryset.filter(workspace_id=ws.id)

        results = []
        for data in items:
            data['workspace'] = ws.id
            if 'id' in data:
                print(data['id'])
                category = categories.get(id=data['id'])
                serializer = CategorySerializer(category, data=data, partial=True)
            else:
                serializer = CategorySerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                results.append(serializer.data)
            else:
                return Response(serializer.errors, status=400)

        return Response(results, status=200)
