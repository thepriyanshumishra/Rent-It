from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, VendorRegisterView, LoginView, LogoutView, RefreshTokenView,
    ProfileView, ChangePasswordView, AddressViewSet, CustomerListView, CustomerDetailView
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-vendor/', VendorRegisterView.as_view(), name='register_vendor'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer_detail'),
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    path('', include(router.urls)),
]
