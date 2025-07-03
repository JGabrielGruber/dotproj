from django.apps import AppConfig


class LlmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'portal.llm'

    def ready(self):
        import portal.llm.signals
