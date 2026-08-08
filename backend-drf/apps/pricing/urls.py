from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PriceListViewSet, RentalPeriodViewSet, ProductPricingViewSet

router = DefaultRouter()
router.register(r'pricelists', PriceListViewSet)
router.register(r'rentalperiods', RentalPeriodViewSet)
router.register(r'productpricing', ProductPricingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
