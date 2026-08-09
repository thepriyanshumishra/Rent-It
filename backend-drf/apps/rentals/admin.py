from django.contrib import admin
from .models import Cart, CartItem, RentalOrder, RentalOrderItem, LateFeeConfig


@admin.register(RentalOrder)
class RentalOrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status', 'payment_status', 'deposit_status',
        'rental_start_date', 'rental_end_date', 'total_amount', 'deposit_amount',
        'late_fee_amount', 'delivery_method', 'created_at'
    ]
    list_filter   = ['status', 'payment_status', 'deposit_status', 'delivery_method']
    search_fields = ['order_number', 'user__username', 'user__email']
    readonly_fields = ['order_number', 'created_at', 'picked_up_at', 'returned_at']


@admin.register(RentalOrderItem)
class RentalOrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'price', 'deposit', 'start_date', 'end_date']


@admin.register(LateFeeConfig)
class LateFeeConfigAdmin(admin.ModelAdmin):
    list_display = ['per_day_rate', 'grace_period_hours', 'max_fee_cap', 'is_active', 'updated_at']


admin.site.register(Cart)
admin.site.register(CartItem)
