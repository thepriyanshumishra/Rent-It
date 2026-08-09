from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, VendorProfile, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter   = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets     = BaseUserAdmin.fieldsets + (
        (_('Role & Extra'), {'fields': ('role', 'phone_number')}),
    )


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'company_name', 'gst_number')
    list_filter   = ()
    search_fields = ('user__username', 'user__email', 'company_name', 'gst_number')


admin.site.register(Address)
