from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, default='Package')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='rented_out_products')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    included_items = models.TextField(blank=True)
    quantity = models.PositiveIntegerField(default=1)
    available_quantity = models.PositiveIntegerField(default=1)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or 'product'
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class RenterListingRequest(models.Model):
    class Status(models.TextChoices):
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
        INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED', 'Inspection Scheduled at HQ'
        APPROVED = 'APPROVED', 'Approved & Listed'
        REJECTED = 'REJECTED', 'Rejected'

    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listing_requests')
    product_name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    daily_price = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)
    purchase_bill_url = models.URLField(max_length=500, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    images_data = models.JSONField(default=list, blank=True)
    included_items = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_VERIFICATION)
    rejection_reason = models.TextField(blank=True, null=True)
    approved_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_request')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name} - {self.renter.username} ({self.status})"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/images/', null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"
