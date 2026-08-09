from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Store(models.Model):
    name        = models.CharField(max_length=255)
    slug        = models.SlugField(max_length=255, unique=True, blank=True)
    code        = models.CharField(max_length=50, unique=True)   # e.g. "DEL-CP-01"
    description = models.TextField(blank=True)
    address     = models.TextField()
    city        = models.CharField(max_length=100)
    state       = models.CharField(max_length=100, default='Delhi')
    pincode     = models.CharField(max_length=20)

    # Exact coordinates for Haversine distance search
    latitude    = models.DecimalField(max_digits=9, decimal_places=6)
    longitude   = models.DecimalField(max_digits=9, decimal_places=6)

    phone          = models.CharField(max_length=20)
    email          = models.EmailField(blank=True, null=True)

    # Operating hours & days
    opening_time   = models.CharField(max_length=20, default='10:00 AM')
    closing_time   = models.CharField(max_length=20, default='08:00 PM')
    operating_days = models.CharField(max_length=100, blank=True, default='Monday – Saturday')

    # Assigned store manager / vendor
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='managed_stores',
    )

    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['city', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.city}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.city}) [{self.code}]"


class StoreProductStock(models.Model):
    store             = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='stocks')
    product           = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='store_stocks')
    total_quantity    = models.PositiveIntegerField(default=5)
    available_quantity = models.PositiveIntegerField(default=5)
    # Tracks how many units are currently locked in RESERVED orders
    reserved_quantity = models.PositiveIntegerField(default=0)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together     = ('store', 'product')
        verbose_name        = 'Store Product Stock'
        verbose_name_plural = 'Store Product Stocks'

    def __str__(self):
        return f"{self.store.name} – {self.product.name} ({self.available_quantity}/{self.total_quantity} avail)"
