from django.urls import path
from .views import DashboardStatsView, RevenueReportView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('revenue/', RevenueReportView.as_view(), name='revenue-report'),
]
