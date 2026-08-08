from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ProductViewSet, ProductImageViewSet, ProductVariantViewSet

router = SimpleRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'product-variants', ProductVariantViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
