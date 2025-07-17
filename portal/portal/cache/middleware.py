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

        if not request.user or not request.user.is_authenticated or not request.user.id:
            return self.get_response(request)

        resource_keys = self._get_resource_keys(path)

        # Check if path matches any configured pattern
        if len(resource_keys) == 0:
            return self.get_response(request)
        resource_key = resource_keys[0]

        # Handle GET: Check for 304 or add timestamp to response
        if request.method == 'GET':
            current_timestamp = self.redis.get_timestamp(resource_key)
            if not current_timestamp:
                # Create new timestamp if none exists
                current_timestamp = self._new_timestamp()
                self.redis.set_timestamp(resource_key, current_timestamp, ttl=self.ttl)

            # Check for 304 Not Modified
            client_etag = request.META.get('HTTP_IF_NONE_MATCH')
            client_timestamp = self._get_timestamp(client_etag)
            if client_timestamp and client_timestamp == current_timestamp:
                return HttpResponse(status=304)

            # Proceed with response and add timestamp header
            response = self.get_response(request)
            self.redis.add_user_resource(resource_key, request.user.id)
            current_etag = self._get_etag(current_timestamp)
            response[self.header_name] = current_etag
            return response

        # Handle POST/PUT/DELETE: Update timestamp
        elif request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            response = self.get_response(request)
            new_timestamp = self._new_timestamp()
            for resource_key in resource_keys:
                self.redis.set_timestamp(resource_key, new_timestamp, ttl=self.ttl)
            new_etag = self._get_etag(new_timestamp)
            response[self.header_name] = new_etag
            return response

        response = self.get_response(request)

        return response

    def _new_timestamp(self):
        return int(time.time())

    def _get_etag(self, timestamp):
        return f'W/"{timestamp}"'

    def _get_timestamp(self, etag=None):
        if not etag:
            return 0
        regex = r'W/"([0-9]+)"'
        match = re.search(regex, etag)
        if match:
            return int(match.group(1))
        return 0

    def _get_resource_keys(self, path):
        """
        Generate a list of Redis keys based on the matching URL pattern(s).
        If an optional parameter is matched, it will generate both the specific key
        (with the parameter) and the broader key (without the parameter).
        """
        matched_keys = []

        for pattern in self.patterns:
            temp_regex = pattern

            # Collect names of optional parameters
            optional_param_names = re.findall(r'<([^>]+)\?>', pattern)

            # Step 1: Build the regex with named capture groups for all parameters
            temp_regex = re.sub(r'/<([^>]+)\?>', r'(?:/(?P<\1>[^/]+))?', temp_regex)
            temp_regex = re.sub(r'/<([^/]+)>', r'/(?P<\1>[^/]+)', temp_regex)

            if temp_regex.endswith('/*'):
                regex_with_wildcard = temp_regex[:-2] + '(?:/.*)?'
            else:
                regex_with_wildcard = temp_regex

            regex = '^' + regex_with_wildcard + '$'

            match_obj = re.match(regex, path)

            if match_obj:
                # --- Found a match, now generate key(s) ---

                # Base key construction logic
                base_key_segments = []
                # Use re.split to get segments including placeholders, then process
                pattern_segments = [s for s in pattern.split('/') if s] # Remove empty strings from split

                for segment in pattern_segments:
                    if '<' not in segment:
                        base_key_segments.append(segment)
                    else:
                        param_name_raw = segment.replace('<', '').replace('>', '')
                        param_name = param_name_raw.replace('?', '') # Clean name for group lookup
                        
                        param_value = match_obj.group(param_name)
                        
                        if param_value:
                            base_key_segments.append(param_value)
                        # If optional param_value is None, we intentionally skip it here
                        # This forms the "broader" key or the specific key if param_value exists

                current_base_key = '/' + '/'.join(base_key_segments)

                # Ensure trailing slash consistency
                if pattern.endswith('/') or pattern.endswith('/*'):
                    if not current_base_key.endswith('/'):
                        current_base_key += '/'
                current_base_key = re.sub(r'/{2,}', '/', current_base_key)

                matched_keys.append(current_base_key) # Add the primary key

                # --- Handle optional ID patterns for additional keys ---
                if optional_param_names:
                    # For each optional parameter in the pattern, try to generate a key without it
                    # This assumes the optional param is the *last* parameter before a wildcard or end.
                    # This logic might need refinement if you have multiple optional params or complex structures.
                    for opt_param_name in optional_param_names:
                        # Construct a key that explicitly excludes this optional parameter
                        # We need to rebuild the key based on the *pattern structure*
                        
                        # Example: /api/workspaces/<id>/tasks/<task_id?>/*
                        # Key with task_id: /api/workspaces/ID/tasks/TASK_ID/
                        # Key without task_id: /api/workspaces/ID/tasks/

                        # Find the segment that contained the optional param
                        segments_for_broader_key = []
                        for seg in pattern_segments:
                            if '<' not in seg:
                                segments_for_broader_key.append(seg)
                            else:
                                raw_p_name = seg.replace('<', '').replace('>', '')
                                if raw_p_name == opt_param_name + '?': # Check if it's THIS optional param
                                    # This segment is skipped for the broader key
                                    pass
                                else:
                                    # It's a mandatory param or another optional param not being excluded in THIS broader key
                                    param_name = raw_p_name.replace('?', '')
                                    param_value = match_obj.group(param_name)
                                    if param_value:
                                        segments_for_broader_key.append(param_value)

                        broader_key = '/' + '/'.join(segments_for_broader_key)
                        if pattern.endswith('/') or pattern.endswith('/*'):
                            if not broader_key.endswith('/'):
                                broader_key += '/'
                        broader_key = re.sub(r'/{2,}', '/', broader_key)
                        
                        # Only add if it's different from the primary key
                        if broader_key != current_base_key and broader_key not in matched_keys:
                            matched_keys.append(broader_key)

                # Since we found a match and generated keys, return them.
                # If you want only the "best" match to generate keys, use 'return matched_keys' here.
                # If you want *all* matching patterns to contribute keys, remove this return.
                # For typical caching, you usually want keys from the most specific match.
                return matched_keys 
        
        # If loop finishes without any match
        return []

