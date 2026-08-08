import uuid
from django.db import models
from catalog.models import Product

class InventoryStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    RESERVED = 'RESERVED', 'Reserved'
    RENTED = 'RENTED', 'Rented'
    UNDER_INSPECTION = 'UNDER_INSPECTION', 'Under Inspection'
    UNDER_REPAIR = 'UNDER_REPAIR', 'Under Repair'
    UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'
    RETIRED = 'RETIRED', 'Retired'

class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_items')
    serial_number = models.CharField(max_length=100, unique=True, blank=True, null=True)
    status = models.CharField(max_length=30, choices=InventoryStatus.choices, default=InventoryStatus.AVAILABLE)
    condition = models.CharField(max_length=100, default='New / Excellent')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} ({self.serial_number or self.id})"

class RepairStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Repair(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='repairs')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=RepairStatus.choices, default=RepairStatus.PENDING)
    priority = models.IntegerField(default=2)
    estimated_cost_paise = models.BigIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Repair: {self.inventory_item} ({self.status})"
