from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Merchant, RenterProfile, CustomerProfile, Address

class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone_number')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'store_code', 'city', 'pincode', 'phone', 'user', 'is_active', 'created_at')
    list_filter = ('city', 'is_active')
    search_fields = ('store_name', 'store_code', 'city', 'pincode', 'user__username')

@admin.register(RenterProfile)
class RenterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'wallet_balance', 'total_earnings', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('user__username', 'user__email')

admin.site.register(User, UserAdmin)
admin.site.register(CustomerProfile)
admin.site.register(Address)
