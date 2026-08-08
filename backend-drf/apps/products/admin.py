from django.contrib import admin
from .models import Category, Product, ProductImage, LenderListingRequest

@admin.register(LenderListingRequest)
class LenderListingRequestAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'lender', 'daily_price', 'security_deposit', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('product_name', 'lender__username', 'lender__email')

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductImage)
