from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User management
    path('api/auth/', include('apps.accounts.urls')),

    # Products & Categories
    path('api/', include('apps.products.urls')),

    # Inventory
    path('api/inventory/', include('apps.inventory.urls')),

    # Pricing
    path('api/pricing/', include('apps.pricing.urls')),

    # Rentals (Cart + Orders)
    path('api/rentals/', include('apps.rentals.urls')),

    # Payments
    path('api/payments/', include('apps.payments.urls')),

    # Security Deposits
    path('api/deposits/', include('apps.deposits.urls')),

    # Late Fees
    path('api/latefees/', include('apps.latefees.urls')),

    # Pickups, Returns, Inspections
    path('api/', include('apps.pickups.urls')),

    # Invoices
    path('api/invoices/', include('apps.invoices.urls')),

    # Notifications
    path('api/notifications/', include('apps.notifications.urls')),

    # Reports & Dashboard
    path('api/reports/', include('apps.reports.urls')),

    # AI Insights (optional)
    path('api/ai/', include('apps.ai_insights.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

