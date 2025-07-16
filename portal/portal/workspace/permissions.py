from rest_framework.permissions import BasePermission

class IsAuthenticatedUser(BasePermission):
    """
    Custom permission to allow only authenticated users to access the view.
    Denies access to AnonymousUser.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.id
