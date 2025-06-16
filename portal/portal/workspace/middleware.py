import threading
from django.db import connection, transaction
from django.utils.deprecation import MiddlewareMixin

_thread_locals = threading.local()

class RoleMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print('HELLOOO')
        # Check if the user is authenticated
        if request.user.is_authenticated:
            transaction.set_autocommit(True)
            with transaction.atomic():
                with connection.cursor() as cursor:
                    if request.user.is_staff:  # Assuming admin users are staff
                        cursor.execute('SET ROLE postgres')
                        cursor.execute("RESET workspace.current_user_id")
                    else:
                        cursor.execute('SET ROLE portal')
                        cursor.execute("SET workspace.current_user_id = %s", [str(request.user.id)])

    def process_response(self, request, response):
        # Optionally, you can reset the role after the response is processed
        # This is not strictly necessary, but can help ensure isolation
        with connection.cursor() as cursor:
            cursor.execute('RESET ROLE;')
        return response

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

        _thread_locals.user = None
        with connection.cursor() as cursor:
            cursor.execute("RESET ROLE")
            cursor.execute("RESET workspace.current_user_id")

        return response

def get_current_user():
    """Get the current user from thread-local storage."""
    return getattr(_thread_locals, 'user', None)
