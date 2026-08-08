from rest_framework import serializers
from .models import PriceList, RentalPeriod, ProductPricing

class PriceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceList
        fields = '__all__'

class RentalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalPeriod
        fields = '__all__'

class ProductPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPricing
        fields = '__all__'
