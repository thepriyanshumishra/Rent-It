from django.contrib import admin
from .models import LateFeeConfig, LateFee

@admin.register(LateFeeConfig)
class LateFeeConfigAdmin(admin.ModelAdmin):
    list_display = ('product', 'daily_rate', 'max_fee', 'grace_period_days')

@admin.register(LateFee)
class LateFeeAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'days_late', 'is_paid')
