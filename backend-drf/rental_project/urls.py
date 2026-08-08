from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User management
    path('api/auth/', include('apps.accounts.urls')),

    # Products, Categories & Renter Listing Requests
    path('api/', include('apps.products.urls')),

    # Rentals (Cart + Orders)
    path('api/rentals/', include('apps.rentals.urls')),

    # Payments
    path('api/payments/', include('apps.payments.urls')),

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
