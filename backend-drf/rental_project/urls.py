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

    # Stores & Physical Hubs
    path('api/', include('apps.stores.urls')),

    # Rentals (Cart + Orders)
    path('api/rentals/', include('apps.rentals.urls')),

    # Notifications
    path('api/notifications/', include('apps.notifications.urls')),

    # Reports & Dashboard stats (admin use)
    path('api/reports/', include('apps.reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
