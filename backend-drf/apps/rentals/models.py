from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string


def generate_order_number():
    """Generate unique RNT-XXXXXX order number."""
    return f"RNT-{''.join(random.choices(string.digits, k=6))}"


def generate_pickup_code():
    """Generate 4-digit store verification code, e.g. PKP-8472."""
    return f"PKP-{''.join(random.choices(string.digits, k=4))}"


class Cart(models.Model):
    user  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    store = models.ForeignKey(
        'stores.Store', on_delete=models.SET_NULL, null=True, blank=True, related_name='carts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart #{self.pk} – {self.user} ({self.store})"


class CartItem(models.Model):
    cart       = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product    = models.ForeignKey(
        'products.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='cart_items'
    )
    quantity   = models.PositiveIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    pickup_slot = models.CharField(max_length=50, default='MORNING_10_1', blank=True)

    def __str__(self):
        return f"CartItem #{self.pk} – qty {self.quantity}"


class LateFeeConfig(models.Model):
    """Global configurable late-fee settings (single-row singleton)."""
    per_day_rate       = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    grace_period_hours = models.PositiveIntegerField(default=2)
    max_fee_cap        = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    is_active          = models.BooleanField(default=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Late Fee Configuration'

    def __str__(self):
        return f"Late Fee: ₹{self.per_day_rate}/day (grace {self.grace_period_hours}h)"

    @classmethod
    def get_config(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class RentalOrder(models.Model):

    class Status(models.TextChoices):
        QUOTATION      = 'QUOTATION',      'Quotation'
        QUOTATION_SENT = 'QUOTATION_SENT', 'Quotation Sent'
        RESERVED       = 'RESERVED',       'Reserved'
        PICKED_UP      = 'PICKED_UP',      'Picked Up'
        LATE_RETURN    = 'LATE_RETURN',    'Late Return'
        RETURNED       = 'RETURNED',       'Returned'
        CANCELLED      = 'CANCELLED',      'Cancelled'

    class DeliveryMethod(models.TextChoices):
        STORE_PICKUP = 'STORE_PICKUP', 'Pick up from Store'
        DELIVERY     = 'DELIVERY',     'Standard Delivery'

    class PickupSlot(models.TextChoices):
        MORNING_10_1   = 'MORNING_10_1',   'Morning (10:00 AM – 01:00 PM)'
        AFTERNOON_2_6  = 'AFTERNOON_2_6',  'Afternoon (02:00 PM – 06:00 PM)'
        EVENING_6_9    = 'EVENING_6_9',    'Evening (06:00 PM – 09:00 PM)'

    class DepositStatus(models.TextChoices):
        HELD               = 'HELD',               'Held in Escrow'
        SETTLED            = 'SETTLED',            'Settled'
        REFUNDED           = 'REFUNDED',           'Fully Refunded'
        PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', 'Partially Refunded'

    class PaymentStatus(models.TextChoices):
        PENDING  = 'PENDING',  'Pending'
        PAID     = 'PAID',     'Paid'
        REFUNDED = 'REFUNDED', 'Refunded'

    class ConditionOnReturn(models.TextChoices):
        GOOD          = 'GOOD',          'Good Condition'
        DAMAGED       = 'DAMAGED',       'Damaged'
        MISSING_ITEMS = 'MISSING_ITEMS', 'Missing Accessories'

    # ── Core ────────────────────────────────────────────────
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    store        = models.ForeignKey(
        'stores.Store', on_delete=models.SET_NULL, null=True, blank=True, related_name='rental_orders'
    )
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.RESERVED)
    created_at = models.DateTimeField(auto_now_add=True)

    # ── Rental period & slot ─────────────────────────────────
    rental_start_date = models.DateField(null=True, blank=True)
    rental_end_date   = models.DateField(null=True, blank=True)
    pickup_slot       = models.CharField(
        max_length=50, choices=PickupSlot.choices, default=PickupSlot.MORNING_10_1
    )
    pickup_code = models.CharField(max_length=20, blank=True)

    # ── Delivery ────────────────────────────────────────────
    delivery_method  = models.CharField(
        max_length=20, choices=DeliveryMethod.choices, default=DeliveryMethod.STORE_PICKUP
    )
    delivery_address = models.TextField(blank=True, null=True)
    delivery_pincode = models.CharField(max_length=20, blank=True, null=True)

    # ── Financials ──────────────────────────────────────────
    total_amount    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_days   = models.IntegerField(default=0)

    # ── Payment & deposit status ─────────────────────────────
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    deposit_status = models.CharField(
        max_length=30, choices=DepositStatus.choices, default=DepositStatus.HELD
    )

    # ── Lifecycle timestamps ─────────────────────────────────
    picked_up_at      = models.DateTimeField(null=True, blank=True)
    returned_at       = models.DateTimeField(null=True, blank=True)
    cancelled_at      = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=500, blank=True)

    # ── Return inspection ────────────────────────────────────
    condition_on_return = models.CharField(
        max_length=20, choices=ConditionOnReturn.choices, null=True, blank=True
    )
    inspection_notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            for _ in range(10):
                candidate = generate_order_number()
                if not RentalOrder.objects.filter(order_number=candidate).exists():
                    self.order_number = candidate
                    break
            else:
                self.order_number = generate_order_number()
        if not self.pickup_code:
            self.pickup_code = generate_pickup_code()
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        if self.rental_end_date and self.status in (
            self.Status.PICKED_UP, self.Status.LATE_RETURN
        ):
            return timezone.now().date() > self.rental_end_date
        return False

    @property
    def days_overdue(self):
        if self.is_overdue:
            return (timezone.now().date() - self.rental_end_date).days
        return 0

    @property
    def calculated_late_fee(self):
        if self.days_overdue <= 0:
            return 0
        try:
            config = LateFeeConfig.get_config()
            if not config.is_active:
                return 0
            fee = self.days_overdue * float(config.per_day_rate)
            return min(fee, float(config.max_fee_cap))
        except Exception:
            return 0

    def __str__(self):
        return f"Order {self.order_number} – {self.user.username} [{self.status}]"


class RentalOrderItem(models.Model):
    order        = models.ForeignKey(RentalOrder, related_name='items', on_delete=models.CASCADE)
    product      = models.ForeignKey(
        'products.Product', on_delete=models.SET_NULL, null=True, blank=True
    )
    product_name = models.CharField(max_length=255, blank=True)  # snapshot at booking time
    quantity     = models.PositiveIntegerField()
    price        = models.DecimalField(max_digits=10, decimal_places=2)
    deposit      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date   = models.DateField(null=True, blank=True)
    end_date     = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.product_name or 'Unknown Product'} × {self.quantity}"
