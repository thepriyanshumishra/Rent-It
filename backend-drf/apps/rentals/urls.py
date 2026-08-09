from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartView, CartItemView, CartItemDetailView, ClearCartView,
    CartViewSet, CartItemViewSet,
    RentalOrderViewSet, RentalOrderItemViewSet,
    LateFeeConfigView,
)

router = DefaultRouter()
router.register(r'orders',      RentalOrderViewSet,     basename='rental-orders')
router.register(r'order-items', RentalOrderItemViewSet, basename='order-items')

urlpatterns = [
    path('cart/',                  CartView.as_view(),           name='cart'),
    path('cart/items/',            CartItemView.as_view(),        name='cart-items-add'),
    path('cart/items/<int:pk>/',   CartItemDetailView.as_view(), name='cart-items-detail'),
    path('cart/clear/',            ClearCartView.as_view(),       name='cart-clear'),
    path('settings/late-fee/',     LateFeeConfigView.as_view(),  name='late-fee-config'),
    path('',                       include(router.urls)),
]
