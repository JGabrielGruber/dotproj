from django.apps import apps
from django.db.models.signals import post_save
from django.conf import settings
from .redis_client import RedisClient
import time

redis = RedisClient()

def update_cache_on_save(sender, instance, **kwargs):
    """Handle post_save to update Redis cache for configured models."""
    for config in settings.PORTAL_CACHE_SIGNALS:
        # Check if sender matches configured app/model
        if (sender._meta.app_label == config['app'] and
                sender._meta.model_name.lower() == config['model'].lower()):
            # Build URL/cache key from instance fields
            key_values = {field: getattr(instance, field) for field in config['keys']}
            resource_key = config['resource'].format(**key_values)

            # Update timestamp in Redis (matches middleware logic)
            new_timestamp = f'W/"{int(time.time())}"'
            redis.set_timestamp(resource_key, new_timestamp, ttl=config.get('ttl'))

for config in settings.PORTAL_CACHE_SIGNALS:
    post_save.connect(receiver=update_cache_on_save, sender=apps.get_model(config['app'], config['model']))
