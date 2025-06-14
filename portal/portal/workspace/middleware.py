import threading
from django.db import connection

_thread_locals = threading.local()

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Store request.user in thread-local for signals
        _thread_locals.user = request.user if request.user.is_authenticated else None

        # Set current_user_id for RLS
        if request.user.is_authenticated:
            with connection.cursor() as cursor:
                cursor.execute("SET workspace.current_user_id = %s", [str(request.user.id)])
        else:
            with connection.cursor() as cursor:
                cursor.execute("RESET workspace.current_user_id")

        response = self.get_response(request)

        # Reset session variable and thread-local
        with connection.cursor() as cursor:
            cursor.execute("RESET workspace.current_user_id")
        _thread_locals.user = None

        return response

def get_current_user():
    """Get the current user from thread-local storage."""
    return getattr(_thread_locals, 'user', None)

