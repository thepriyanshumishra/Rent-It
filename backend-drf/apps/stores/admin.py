from django.contrib import admin
from .models import Store, StoreProductStock

class StoreProductStockInline(admin.TabularInline):
    model = StoreProductStock
    extra = 1

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'code', 'phone', 'manager', 'is_active')
    list_filter = ('city', 'is_active', 'state')
    search_fields = ('name', 'city', 'code', 'address', 'pincode')
    prepopulated_fields = {'slug': ('city', 'name')}
    inlines = [StoreProductStockInline]

@admin.register(StoreProductStock)
class StoreProductStockAdmin(admin.ModelAdmin):
    list_display = ('store', 'product', 'available_quantity', 'total_quantity', 'updated_at')
    list_filter = ('store', 'product__category')
    search_fields = ('store__name', 'product__name')
