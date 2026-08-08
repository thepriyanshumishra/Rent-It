from django.contrib import admin
from .models import Pickup, Return, ProductInspection, DamageReport

admin.site.register(Pickup)
admin.site.register(Return)
admin.site.register(ProductInspection)
admin.site.register(DamageReport)
