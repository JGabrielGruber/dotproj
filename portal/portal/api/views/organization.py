import logging
from rest_framework.viewsets import ModelViewSet
from portal.workspace.models import Organization, OrganizationMember
from portal.api.serializers import OrganizationSerializer, OrganizationMemberSerializer

logger = logging.getLogger(__name__)

class OrganizationViewSet(ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        queryset = Organization.objects.all()
        return queryset

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} creating organization")
        serializer.save()

    def perform_update(self, serializer):
        logger.info(f"User {self.request.user.username} updating organization {self.get_object().id}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.username} deleting organization {instance.id}")
        instance.delete()

class OrganizationMemberViewSet(ModelViewSet):
    queryset = OrganizationMember.objects.all()
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        queryset = Organization.objects.all()
        org_id = self.kwargs['org_pk']
        return queryset.filter(organization_id=org_id)

    def perform_create(self, serializer):
        logger.info(f"User {self.request.user.username} adding member to organization {self.kwargs['org_pk']}")
        serializer.save(organization_id=self.kwargs['org_pk'])
