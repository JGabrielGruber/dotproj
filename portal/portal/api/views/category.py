import logging
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Category
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

