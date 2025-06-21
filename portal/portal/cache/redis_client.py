import json
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
        self.client.publish(
            "resource-updates",
            json.dumps({ "key": key, "timestamp": timestamp }),
        )

    def delete_timestamp(self, key):
        self.client.delete(key)

    def add_user_resource(self, key, user):
        self.client.sadd(f"resource-users:{key}", user)

