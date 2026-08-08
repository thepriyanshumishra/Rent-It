import uuid
from django.db import models

class ProductCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return self.name

class ProductStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    DRAFT = 'DRAFT', 'Draft'

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_desc = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ProductStatus.choices, default=ProductStatus.DRAFT)
    deposit_amount_paise = models.BigIntegerField(default=0)  # Integer Paise for money precision
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductAttribute(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes')
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.key}: {self.value}"

class Pricelist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False)
    currency = models.CharField(max_length=10, default='INR')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DurationUnit(models.TextChoices):
    HOUR = 'HOUR', 'Hour'
    DAY = 'DAY', 'Day'
    WEEK = 'WEEK', 'Week'
    MONTH = 'MONTH', 'Month'

class PriceRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pricelist = models.ForeignKey(Pricelist, on_delete=models.CASCADE, related_name='rules')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_rules')
    duration_unit = models.CharField(max_length=20, choices=DurationUnit.choices, default=DurationUnit.DAY)
    duration_value = models.IntegerField(default=1)
    rate_paise = models.BigIntegerField()  # Integer Paise
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.rate_paise/100} INR/{self.duration_unit}"
