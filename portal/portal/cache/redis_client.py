import redis
from django.conf import settings

class RedisClient:
    def __init__(self):
        config = settings.PORTAL_CACHE.get('REDIS', {})
        self.client = redis.Redis(
            host=config.get('HOST', 'localhost'),
            port=config.get('PORT', 6379),
            db=config.get('DB', 0),
            decode_responses=True
        )

    def get_timestamp(self, key):
        return self.client.get(key)

    def set_timestamp(self, key, timestamp, ttl=None):
        self.client.set(key, timestamp, ex=ttl)

    def delete_timestamp(self, key):
        self.client.delete(key)
