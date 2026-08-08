from django.contrib import admin
from .models import PriceList, RentalPeriod, ProductPricing

admin.site.register(PriceList)
admin.site.register(RentalPeriod)
admin.site.register(ProductPricing)
