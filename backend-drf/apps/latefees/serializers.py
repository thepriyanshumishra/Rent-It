from rest_framework import serializers
from .models import LateFeeConfig, LateFee

class LateFeeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LateFeeConfig
        fields = '__all__'

class LateFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LateFee
        fields = '__all__'
