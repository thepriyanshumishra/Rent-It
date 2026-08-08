from rest_framework import viewsets
from .models import PriceList, RentalPeriod, ProductPricing
from .serializers import PriceListSerializer, RentalPeriodSerializer, ProductPricingSerializer

class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer

class RentalPeriodViewSet(viewsets.ModelViewSet):
    queryset = RentalPeriod.objects.all()
    serializer_class = RentalPeriodSerializer

class ProductPricingViewSet(viewsets.ModelViewSet):
    queryset = ProductPricing.objects.all()
    serializer_class = ProductPricingSerializer
