from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreViewSet, StoreProductStockViewSet

router = DefaultRouter()
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'store-stocks', StoreProductStockViewSet, basename='store-stock')

urlpatterns = [
    path('', include(router.urls)),
]
