from django.contrib import admin
from .models import ProductCategory, Product, ProductAttribute, Pricelist, PriceRule

admin.site.register(ProductCategory)

class PriceRuleInline(admin.TabularInline):
    model = PriceRule
    extra = 1

class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'deposit_amount_paise')
    list_filter = ('status', 'category')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [PriceRuleInline, ProductAttributeInline]

admin.site.register(Pricelist)
admin.site.register(PriceRule)
