from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityDepositViewSet, DepositHistoryViewSet

router = DefaultRouter()
router.register(r'deposits', SecurityDepositViewSet)
router.register(r'deposit-history', DepositHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
