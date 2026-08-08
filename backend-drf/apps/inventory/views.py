from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import InventoryItem, InventoryLog
from .serializers import InventoryItemSerializer, InventoryLogSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdminUser]

class InventoryLogViewSet(viewsets.ModelViewSet):
    queryset = InventoryLog.objects.all()
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        item = serializer.validated_data['inventory_item']
        quantity_changed = serializer.validated_data['quantity_changed']
        previous_quantity = item.quantity
        new_quantity = item.quantity + quantity_changed

        item.quantity = new_quantity
        item.save()

        serializer.save(
            user=self.request.user,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity
        )
