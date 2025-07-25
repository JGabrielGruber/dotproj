from django.apps import AppConfig


class CacheConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'portal.cache'

    def ready(self):
        import portal.cache.signals
