from django.db import models

CONDITION_CHOICES = [
    ('excellent', 'Excellent'),
    ('good', 'Good'),
    ('fair', 'Fair'),
    ('damaged', 'Damaged'),
    ('missing_items', 'Missing Items'),
]

STATUS_CHOICES = [
    ('scheduled', 'Scheduled'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]

class Pickup(models.Model):
    order = models.ForeignKey('rentals.RentalOrder', on_delete=models.CASCADE, related_name='pickups')
    scheduled_at = models.DateTimeField()
    confirmed_at = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    confirmed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='confirmed_pickups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pickup for Order {self.order.order_number} - {self.status}"

RETURN_STATUS_CHOICES = [
    ('expected', 'Expected'),
    ('initiated', 'Return Initiated'),
    ('received', 'Received'),
    ('inspected', 'Inspected'),
    ('completed', 'Completed'),
]

class Return(models.Model):
    order = models.ForeignKey('rentals.RentalOrder', on_delete=models.CASCADE, related_name='returns')
    scheduled_return = models.DateField(null=True, blank=True)
    actual_return_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=RETURN_STATUS_CHOICES, default='expected')
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='received_returns')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Return for Order {self.order.order_number} - {self.status}"

class ProductInspection(models.Model):
    return_record = models.ForeignKey(Return, on_delete=models.CASCADE, related_name='inspections')
    inventory_item = models.ForeignKey('inventory.InventoryItem', on_delete=models.CASCADE, null=True, blank=True)
    inspector = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='inspections')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    is_late = models.BooleanField(default=False)
    has_damage = models.BooleanField(default=False)
    has_missing_items = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    inspected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inspection for Return {self.return_record.id}"

class DamageReport(models.Model):
    inspection = models.ForeignKey(ProductInspection, on_delete=models.CASCADE, related_name='damage_reports')
    description = models.TextField()
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Damage Report for Inspection {self.inspection.id}"

