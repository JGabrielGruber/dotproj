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
        response = self.get_response(request)
        path = request.path

        # Check if path matches any configured pattern
        if not self._matches_pattern(path):
            return response

        resource_key = self._get_resource_key(path)

        # Handle GET: Check for 304 or add timestamp to response
        if request.method == 'GET':
            current_timestamp = self.redis.get_timestamp(resource_key)
            if not current_timestamp:
                # Create new timestamp if none exists
                current_timestamp = str(int(time.time()))
                self.redis.set_timestamp(resource_key, current_timestamp, ttl=self.ttl)

            # Check for 304 Not Modified
            client_timestamp = request.META.get('HTTP_IF_NONE_MATCH')
            if client_timestamp and client_timestamp == current_timestamp:
                return HttpResponse(status=304)

            # Proceed with response and add timestamp header
            response = self.get_response(request)
            response[self.header_name] = current_timestamp
            return response

        # Handle POST/PUT/DELETE: Update timestamp
        elif request.method in ['POST', 'PUT', 'DELETE']:
            new_timestamp = str(int(time.time()))
            print(resource_key, new_timestamp)
            self.redis.set_timestamp(resource_key, new_timestamp, ttl=self.ttl)

        return response

    def _matches_pattern(self, path):
        for pattern in self.patterns:
            # Convert Django-style patterns to regex
            regex = re.sub(r'<[^>]+>', r'[^/]+', pattern).replace('*', '.*')
            if re.match(regex, path):
                return True
        return False

    def _get_resource_key(self, path):
        """
        Generate a Redis key based on the matching URL pattern, using the actual UUID
        from the path and removing the wildcard subpath.
        """
        for pattern in self.patterns:
            # Convert pattern to regex, capturing UUID
            regex = re.sub(r'<[^>]+>', r'([0-9a-f-]{36})', pattern).replace('*', '.*')
            match = re.match(regex, path)
            if match:
                # Get the UUID from the path
                uuid = match.group(1)
                # Build key by replacing <id> with UUID and removing /*
                key = re.sub(r'<[^>]+>', uuid, pattern)
                key = re.sub(r'/\*$', '/', key)
                return key
        # Fallback: use path, replace UUID with itself, strip subpaths
        key = re.sub(r'/[0-9a-f-]{36}/', r'/:id/', path)
        return re.sub(r'/[^/]+/?$', '/', key)

