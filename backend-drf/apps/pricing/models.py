from django.db import models

class PriceList(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class RentalPeriod(models.Model):
    name = models.CharField(max_length=50)
    duration_hours = models.IntegerField()

    def __str__(self):
        return self.name

class ProductPricing(models.Model):
    product_id = models.IntegerField(null=True, blank=True) # generic
    price_list = models.ForeignKey(PriceList, on_delete=models.CASCADE)
    period = models.ForeignKey(RentalPeriod, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
