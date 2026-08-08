from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuotationViewSet, QuotationItemViewSet, BusinessOrderViewSet

router = DefaultRouter()
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'quotation-items', QuotationItemViewSet, basename='quotation-item')
router.register(r'business-orders', BusinessOrderViewSet, basename='business-order')

urlpatterns = [
    path('', include(router.urls)),
]
