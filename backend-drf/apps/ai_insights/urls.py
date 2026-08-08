from django.urls import path
from .views import PricingInsightsView, MaintenancePredictionView

urlpatterns = [
    path('pricing/<int:item_id>/', PricingInsightsView.as_view(), name='pricing-insights'),
    path('maintenance/<int:item_id>/', MaintenancePredictionView.as_view(), name='maintenance-prediction'),
]
