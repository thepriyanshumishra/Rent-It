from django.contrib import admin
from .models import Cart, CartItem, RentalOrder, RentalOrderItem

admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(RentalOrder)
admin.site.register(RentalOrderItem)
