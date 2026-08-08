from rest_framework import serializers
from .models import Pickup, Return, ProductInspection, DamageReport

class PickupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pickup
        fields = '__all__'

class ReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Return
        fields = '__all__'

class ProductInspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInspection
        fields = '__all__'

class DamageReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageReport
        fields = '__all__'
