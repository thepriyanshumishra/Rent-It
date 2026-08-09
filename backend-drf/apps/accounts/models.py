from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', _('Customer')
        ADMIN    = 'ADMIN',    _('Admin')
        STAFF    = 'STAFF',    _('Staff / Vendor')

    role         = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    # max_length=20 to safely handle +91-XXXXX-XXXXX and international formats
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username


class VendorProfile(models.Model):
    """Extra business info for STAFF (vendor) users."""
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    company_name = models.CharField(max_length=255, blank=True, default='')
    gst_number   = models.CharField(max_length=50,  blank=True, default='')
    logo         = models.ImageField(upload_to='vendor_logos/', blank=True, null=True)

    def __str__(self):
        return f"Vendor – {self.company_name} ({self.user.username})"


class Address(models.Model):
    """Saved delivery addresses for customers."""
    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255)
    city           = models.CharField(max_length=100)
    state          = models.CharField(max_length=100)
    postal_code    = models.CharField(max_length=20)
    country        = models.CharField(max_length=100, default='India')
    is_default     = models.BooleanField(default=False)
    # Coordinates populated from pincode lookup — used for distance calculations
    latitude       = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude      = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} – {self.city}"
