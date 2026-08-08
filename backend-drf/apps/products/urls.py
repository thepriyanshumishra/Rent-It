from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    CategoryViewSet, ProductViewSet, ProductImageViewSet,
    ProductVariantViewSet, RenterListingRequestViewSet, DirectFileUploadView
)

router = SimpleRouter()
router.register(r'listing-requests', RenterListingRequestViewSet, basename='listing-requests')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'product-images', ProductImageViewSet, basename='product-images')
router.register(r'product-variants', ProductVariantViewSet, basename='product-variants')

urlpatterns = [
    path('upload/', DirectFileUploadView.as_view(), name='direct-upload'),
    path('', include(router.urls)),
]
