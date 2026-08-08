from rest_framework import serializers
from .models import InventoryItem, InventoryLog

class InventoryItemSerializer(serializers.ModelSerializer):
    available_quantity = serializers.ReadOnlyField()

    class Meta:
        model = InventoryItem
        fields = '__all__'

class InventoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLog
        fields = '__all__'
        read_only_fields = ('previous_quantity', 'new_quantity', 'user')
