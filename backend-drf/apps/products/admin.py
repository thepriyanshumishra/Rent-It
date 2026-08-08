from django.contrib import admin
from .models import Category, Product, ProductImage, RenterListingRequest

@admin.register(RenterListingRequest)
class RenterListingRequestAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'renter', 'daily_price', 'security_deposit', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('product_name', 'renter__username', 'renter__email')

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductImage)
