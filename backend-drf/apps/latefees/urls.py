from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LateFeeConfigViewSet, LateFeeViewSet

router = DefaultRouter()
router.register(r'configs', LateFeeConfigViewSet)
router.register(r'fees', LateFeeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
