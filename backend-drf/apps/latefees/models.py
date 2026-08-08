from django.db import models

class LateFeeConfig(models.Model):
    product = models.OneToOneField('products.Product', on_delete=models.CASCADE, related_name='late_fee_config')
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    max_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    grace_period_days = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Late Fee Config for {self.product}"

class LateFee(models.Model):
    order = models.ForeignKey('rentals.RentalOrder', on_delete=models.CASCADE, related_name='late_fees')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    days_late = models.PositiveIntegerField()
    calculated_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Late Fee for Order {self.order.id} - {self.amount}"
