from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RentalOrder

@receiver(post_save, sender=RentalOrder)
def rental_order_saved(sender, instance, created, **kwargs):
    pass
