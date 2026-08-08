from django.db import models
from django.conf import settings
import random
import string

def generate_pickup_code():
    return ''.join(random.choices(string.digits, k=6))

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()
    quantity = models.PositiveIntegerField(default=1)
    rental_period = models.ForeignKey('pricing.RentalPeriod', on_delete=models.SET_NULL, null=True)

class RentalOrder(models.Model):
    class FulfillmentType(models.TextChoices):
        DOORSTEP = 'DOORSTEP', 'Doorstep Delivery'
        STORE_PICKUP = 'STORE_PICKUP', 'Store Pickup'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    merchant = models.ForeignKey('accounts.Merchant', on_delete=models.SET_NULL, null=True, blank=True, related_name='rental_orders')
    fulfillment_type = models.CharField(max_length=20, choices=FulfillmentType.choices, default=FulfillmentType.DOORSTEP)
    pickup_code = models.CharField(max_length=10, default=generate_pickup_code, blank=True)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_pincode = models.CharField(max_length=20, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} ({self.fulfillment_type})"

class RentalOrderItem(models.Model):
    order = models.ForeignKey(RentalOrder, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
