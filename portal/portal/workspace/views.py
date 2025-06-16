from django.http import JsonResponse
from django.db import connection

def current_role_view(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT current_role;")
        current_role = cursor.fetchone()[0]
    return JsonResponse({'current_role': current_role})
