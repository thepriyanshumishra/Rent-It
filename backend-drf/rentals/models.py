import uuid
from django.db import models
from django.conf import settings
from core.models import Customer, Address
from catalog.models import Product
from inventory.models import InventoryItem

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

class RentalStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION', 'Pending Confirmation'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    ACTIVE = 'ACTIVE', 'Active'
    OVERDUE = 'OVERDUE', 'Overdue'
    RETURNED = 'RETURNED', 'Returned'
    UNDER_INSPECTION = 'UNDER_INSPECTION', 'Under Inspection'
    PENDING_SETTLEMENT = 'PENDING_SETTLEMENT', 'Pending Settlement'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class FulfillmentType(models.TextChoices):
    STORE_PICKUP = 'STORE_PICKUP', 'Store Pickup'
    DELIVERY = 'DELIVERY', 'Delivery'

class Rental(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='rentals')
    status = models.CharField(max_length=30, choices=RentalStatus.choices, default=RentalStatus.DRAFT)
    fulfillment_type = models.CharField(max_length=20, choices=FulfillmentType.choices, default=FulfillmentType.STORE_PICKUP)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    actual_return_date = models.DateTimeField(null=True, blank=True)
    subtotal_paise = models.BigIntegerField(default=0)
    deposit_total_paise = models.BigIntegerField(default=0)
    late_fees_paise = models.BigIntegerField(default=0)
    total_paise = models.BigIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rental_number} - {self.customer.name} ({self.status})"

class RentalItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='rental_commitments')
    quantity = models.IntegerField(default=1)
    unit_price_paise = models.BigIntegerField()
    total_paise = models.BigIntegerField()

    def __str__(self):
        return f"{self.product.name} ×{self.quantity}"

class FulfillmentStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class Fulfillment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='fulfillment')
    type = models.CharField(max_length=20, choices=FulfillmentType.choices)
    status = models.CharField(max_length=20, choices=FulfillmentStatus.choices, default=FulfillmentStatus.SCHEDULED)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class ReturnRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='return_record')
    returned_at = models.DateTimeField()
    returned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class InspectionResult(models.TextChoices):
    OK = 'OK', 'OK / Perfect'
    DAMAGED = 'DAMAGED', 'Damaged'
    MISSING_ITEMS = 'MISSING_ITEMS', 'Missing Items'

class InspectionRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    return_record = models.OneToOneField(ReturnRecord, on_delete=models.CASCADE, related_name='inspection')
    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='inspection')
    result = models.CharField(max_length=20, choices=InspectionResult.choices)
    notes = models.TextField(blank=True, null=True)
    inspected_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

class DamageSeverity(models.TextChoices):
    MINOR = 'MINOR', 'Minor'
    MODERATE = 'MODERATE', 'Moderate'
    SEVERE = 'SEVERE', 'Severe'

class Damage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inspection = models.ForeignKey(InspectionRecord, on_delete=models.CASCADE, related_name='damages')
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=DamageSeverity.choices)
    charge_amount_paise = models.BigIntegerField()

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SUCCEEDED = 'SUCCEEDED', 'Succeeded'
    FAILED = 'FAILED', 'Failed'

class PaymentMethod(models.TextChoices):
    SIMULATED = 'SIMULATED', 'Simulated'
    CASH = 'CASH', 'Cash'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, related_name='payments')
    amount_paise = models.BigIntegerField()
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.SIMULATED)
    provider_ref = models.CharField(max_length=100, blank=True, null=True)
    idempotency_key = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class DepositStatus(models.TextChoices):
    HELD = 'HELD', 'Held'
    SETTLED = 'SETTLED', 'Settled'
    FORFEITED = 'FORFEITED', 'Forfeited'

class SecurityDeposit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, related_name='deposits')
    amount_paise = models.BigIntegerField()
    status = models.CharField(max_length=20, choices=DepositStatus.choices, default=DepositStatus.HELD)
    settled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ChargeType(models.TextChoices):
    LATE_FEE = 'LATE_FEE', 'Late Fee'
    DAMAGE = 'DAMAGE', 'Damage'
    MISSING_ITEM = 'MISSING_ITEM', 'Missing Item'
    OTHER = 'OTHER', 'Other'

class Charge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, related_name='charges')
    type = models.CharField(max_length=20, choices=ChargeType.choices)
    amount_paise = models.BigIntegerField()
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class SettlementStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'

class Settlement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='settlement')
    total_charges_paise = models.BigIntegerField()
    deposit_deducted_paise = models.BigIntegerField()
    refund_amount_paise = models.BigIntegerField()
    status = models.CharField(max_length=20, choices=SettlementStatus.choices, default=SettlementStatus.COMPLETED)
    notes = models.TextField(blank=True, null=True)
    settled_at = models.DateTimeField(auto_now_add=True)
