import threading
from django.db import connection

_thread_locals = threading.local()

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Store request.user in thread-local for signals
        _thread_locals.user = request.user if request.user.is_authenticated else None

        # Skip role change for staff users or /admin/ paths
        is_admin = request.path.startswith('/admin/') or (request.user.is_authenticated and request.user.is_staff)

        # Set session role and current_user_id
        with connection.cursor() as cursor:
            if not is_admin:
                cursor.execute("SET ROLE portal")
            if request.user.is_authenticated:
                cursor.execute("SET workspace.current_user_id = %s", [str(request.user.id)])
            else:
                cursor.execute("RESET workspace.current_user_id")

        response = self.get_response(request)

        # Reset session role and variables
        with connection.cursor() as cursor:
            cursor.execute("RESET ROLE")
            cursor.execute("RESET workspace.current_user_id")
        _thread_locals.user = None

        return response

def get_current_user():
    """Get the current user from thread-local storage."""
    return getattr(_thread_locals, 'user', None)
