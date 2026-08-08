from rest_framework import serializers
from .models import SecurityDeposit, DepositHistory

class DepositHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositHistory
        fields = '__all__'

class SecurityDepositSerializer(serializers.ModelSerializer):
    history = DepositHistorySerializer(many=True, read_only=True)
    class Meta:
        model = SecurityDeposit
        fields = '__all__'
