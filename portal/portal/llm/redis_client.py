from django.conf import settings
from redis import Redis

class RedisClient:
    def __init__(self):
        self.client = Redis.from_url(settings.PORTAL_LLM_RQ_REDIS_URL)

    def get_con(self):
        return self.client

redis = RedisClient()

