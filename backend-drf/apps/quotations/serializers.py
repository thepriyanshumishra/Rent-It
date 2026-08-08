from rest_framework import serializers
from .models import Quotation, QuotationItem, BusinessOrder

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    class Meta:
        model = Quotation
        fields = '__all__'

class BusinessOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessOrder
        fields = '__all__'
