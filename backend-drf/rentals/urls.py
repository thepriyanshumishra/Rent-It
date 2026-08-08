from django.urls import path
from .views import (
    CartView, CheckoutView, ConfirmPaymentView, RentalListView, RentalDetailView,
    ConfirmPickupView, ProcessReturnView, ProcessInspectionView, SettleRentalView, AdminDashboardView, RequestReturnView
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartView.as_view(), name='cart-items'),
    path('rentals/', RentalListView.as_view(), name='rental-list'),
    path('rentals/checkout/', CheckoutView.as_view(), name='checkout'),
    path('rentals/<uuid:pk>/', RentalDetailView.as_view(), name='rental-detail'),
    path('rentals/<uuid:pk>/request-return/', RequestReturnView.as_view(), name='request-return'),
    path('rentals/<uuid:pk>/confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('rentals/<uuid:pk>/pickup/', ConfirmPickupView.as_view(), name='pickup'),
    path('rentals/<uuid:pk>/return/', ProcessReturnView.as_view(), name='return'),
    path('rentals/<uuid:pk>/inspect/', ProcessInspectionView.as_view(), name='inspect'),
    path('rentals/<uuid:pk>/settle/', SettleRentalView.as_view(), name='settle'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]
