import re
from django.conf import settings
import time

from django.http.response import HttpResponse

from .redis_client import RedisClient

class CacheTimestampMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.redis = RedisClient()
        self.patterns = settings.PORTAL_CACHE.get('ROUTE_PATTERNS', [])
        self.header_name = settings.PORTAL_CACHE.get('HEADER_NAME', 'ETag')
        self.ttl = settings.PORTAL_CACHE.get('TIMESTAMP_TTL', None)

    def __call__(self, request):
        path = request.path

        # Check if path matches any configured pattern
        if not self._matches_pattern(path):
            return self.get_response(request)

        resource_key = self._get_resource_key(path)

        # Handle GET: Check for 304 or add timestamp to response
        if request.method == 'GET':
            current_timestamp = self.redis.get_timestamp(resource_key)
            if not current_timestamp:
                # Create new timestamp if none exists
                current_timestamp = self._new_timestamp()
                self.redis.set_timestamp(resource_key, current_timestamp, ttl=self.ttl)

            # Check for 304 Not Modified
            client_timestamp = request.META.get('HTTP_IF_NONE_MATCH')
            if client_timestamp and client_timestamp == current_timestamp:
                return HttpResponse(status=304)

            # Proceed with response and add timestamp header
            response = self.get_response(request)
            self.redis.add_user_resource(resource_key, request.user.id)
            response[self.header_name] = current_timestamp
            return response

        # Handle POST/PUT/DELETE: Update timestamp
        elif request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            new_timestamp = self._new_timestamp()
            self.redis.set_timestamp(resource_key, new_timestamp, ttl=self.ttl)

        response = self.get_response(request)

        return response

    def _new_timestamp(self):
        return f'W/"{int(time.time())}"'

    def _matches_pattern(self, path):
        for pattern in self.patterns:
            # Convert Django-style patterns to regex
            regex = re.sub(r'<[^>]+>', r'[^/]+', pattern).replace('*', '.*')
            if re.match(regex, path):
                return True
        return False

    def _get_resource_key(self, path):
        """
        Generate a Redis key based on the matching URL pattern, using actual UUIDs
        from the path and removing the wildcard subpath.
        """
        for pattern in self.patterns:
            # Convert pattern to regex, capturing all UUIDs
            regex = re.sub(r'<[^>]+>', r'([0-9a-f-]{36})', pattern).replace('*', '.*')
            match = re.match(regex, path)
            if match:
                # Get all UUIDs from the path
                uuids = match.groups()
                # Build key by replacing each <id> with corresponding UUID
                key = pattern
                for i, uuid in enumerate(uuids, 1):
                    key = re.sub(rf'<[^>]+>', uuid, key, count=1)
                # Remove /* subpath
                key = re.sub(r'/\*$', '/', key)
                return key
        # Fallback: replace UUIDs with :id and strip subpaths
        key = re.sub(r'/[0-9a-f-]{36}/', r'/:id/', path)
        return re.sub(r'/[^/]+/?$', '/', key)

