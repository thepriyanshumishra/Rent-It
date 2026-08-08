from django.contrib import admin
from .models import Rental, RentalItem, Fulfillment, ReturnRecord, InspectionRecord, Damage, Payment, SecurityDeposit, Charge, Settlement

class RentalItemInline(admin.TabularInline):
    model = RentalItem
    extra = 0

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('rental_number', 'customer', 'status', 'start_date', 'end_date', 'total_paise')
    list_filter = ('status', 'fulfillment_type')
    search_fields = ('rental_number', 'customer__name')
    inlines = [RentalItemInline]

admin.site.register(Payment)
admin.site.register(SecurityDeposit)
admin.site.register(Charge)
admin.site.register(Settlement)
admin.site.register(ReturnRecord)
admin.site.register(InspectionRecord)
admin.site.register(Damage)
