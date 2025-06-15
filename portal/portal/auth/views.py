import logging
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

from portal.auth.serializers import LoginSerializer

logger = logging.getLogger(__name__)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"User {user.username} logged in, token created: {created}")
        return Response({
            'token': token.key,
            'user': {'id': user.id, 'username': user.username}
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        logger.info(f"User {request.user.username} logging out")
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def login_view(request):
    return render(request, 'login.html')
