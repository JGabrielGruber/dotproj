from django.apps import AppConfig


class WorkspaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'portal.workspace'

    def ready(self):
        import portal.workspace.signals
