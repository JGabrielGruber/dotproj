from django.urls import path
from .views import current_role_view

urlpatterns = [
    path('current-role/', current_role_view, name='current_role'),
]
