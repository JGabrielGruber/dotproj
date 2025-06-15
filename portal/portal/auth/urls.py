from django.urls import path
from .views import LoginView, LogoutView, login_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
