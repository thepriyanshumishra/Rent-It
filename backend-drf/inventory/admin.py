from django.contrib import admin
from .models import InventoryItem, Repair

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'serial_number', 'status', 'condition')
    list_filter = ('status', 'condition')
    search_fields = ('serial_number', 'product__name')

@admin.register(Repair)
class RepairAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority')
