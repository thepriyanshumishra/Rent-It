from django.db import models
from django.conf import settings
import random
import string

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()
    quantity = models.PositiveIntegerField(default=1)

def generate_order_number():
    return f"RNT-{''.join(random.choices(string.digits, k=6))}"

class RentalOrder(models.Model):
    order_number = models.CharField(max_length=50, default=generate_order_number, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_pincode = models.CharField(max_length=20, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.user.username}"

class RentalOrderItem(models.Model):
    order = models.ForeignKey(RentalOrder, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
