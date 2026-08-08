from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, LenderProfile, CustomerProfile, Address

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Role & Extra'), {'fields': ('role', 'phone_number')}),
    )

@admin.register(LenderProfile)
class LenderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'wallet_balance', 'total_earnings', 'is_verified')
    list_filter = ('is_verified',)
    search_fields = ('user__username', 'user__email')

admin.site.register(CustomerProfile)
admin.site.register(Address)
