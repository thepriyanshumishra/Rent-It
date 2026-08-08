from django.contrib import admin
from .models import Quotation, QuotationItem, BusinessOrder

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'total_amount', 'created_at')

@admin.register(BusinessOrder)
class BusinessOrderAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_name', 'email', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('company_name', 'contact_name', 'email', 'phone')
