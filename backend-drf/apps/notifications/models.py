from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):

    class Type(models.TextChoices):
        ORDER_CONFIRMED  = 'ORDER_CONFIRMED',  _('Order Confirmed')
        PICKUP_READY     = 'PICKUP_READY',     _('Ready for Pickup')
        EQUIPMENT_OUT    = 'EQUIPMENT_OUT',    _('Equipment Picked Up')
        RETURN_DUE       = 'RETURN_DUE',       _('Return Due Soon')
        ORDER_RETURNED   = 'ORDER_RETURNED',   _('Order Returned')
        ORDER_CANCELLED  = 'ORDER_CANCELLED',  _('Order Cancelled')
        DEPOSIT_REFUNDED = 'DEPOSIT_REFUNDED', _('Deposit Refunded')
        GENERAL          = 'GENERAL',          _('General')

    user              = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30, choices=Type.choices, default=Type.GENERAL
    )
    message           = models.TextField()
    # Link to the related order so frontend can navigate directly
    order             = models.ForeignKey(
        'rentals.RentalOrder', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications'
    )
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.user.email} – {'Read' if self.is_read else 'Unread'}"
