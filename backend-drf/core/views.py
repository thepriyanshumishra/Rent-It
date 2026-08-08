from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Customer
from .serializers import RegisterSerializer, UserSerializer, CustomerSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'error': {'message': 'Validation failed', 'details': serializer.errors}}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if User.objects.filter(email=data['email'].lower()).exists():
            return Response({'success': False, 'error': {'message': 'User with this email already exists'}}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data['email'].lower(),
            email=data['email'].lower(),
            password=data['password'],
            role=data.get('role', User.Role.CUSTOMER)
        )

        customer = None
        if user.role == User.Role.CUSTOMER:
            customer = Customer.objects.create(user=user, name=data['name'], phone=data.get('phone', ''))

        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role,
                    'customer': {'id': str(customer.id), 'name': customer.name} if customer else None
                },
                'tokens': {
                    'accessToken': str(refresh.access_token),
                    'refreshToken': str(refresh),
                }
            }
        }, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        customer = getattr(user, 'customer_profile', None)
        return Response({
            'success': True,
            'data': {
                'id': str(user.id),
                'email': user.email,
                'role': user.role,
                'customer': CustomerSerializer(customer).data if customer else None
            }
        })
