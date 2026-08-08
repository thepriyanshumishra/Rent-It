from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuotationViewSet, QuotationItemViewSet

router = DefaultRouter()
router.register(r'quotations', QuotationViewSet)
router.register(r'items', QuotationItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
