from django.urls import path
from .views import ProductListView, ProductDetailView, CategoryListView, AvailabilityCheckView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/categories/', CategoryListView.as_view(), name='category-list'),
    path('products/<uuid:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<uuid:pk>/availability/', AvailabilityCheckView.as_view(), name='product-availability'),
]
