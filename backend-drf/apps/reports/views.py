from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta
from apps.accounts.permissions import IsAdminUser

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            from apps.rentals.models import RentalOrder
            from apps.accounts.models import User

            now = timezone.now()
            thirty_days_ago = now - timedelta(days=30)

            total_rentals = RentalOrder.objects.count()
            active_rentals = RentalOrder.objects.filter(status='ACTIVE').count()
            overdue_rentals = RentalOrder.objects.filter(status='OVERDUE').count()
            returned_rentals = RentalOrder.objects.filter(status='RETURNED').count()
            completed_rentals = RentalOrder.objects.filter(status='COMPLETED').count()

            revenue_result = RentalOrder.objects.filter(
                status__in=['COMPLETED', 'RETURNED', 'ACTIVE'],
                created_at__gte=thirty_days_ago
            ).aggregate(total=Sum('total_amount'))
            revenue_this_month = float(revenue_result['total'] or 0)

            new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()

            data = {
                "total_rentals": total_rentals,
                "active_rentals": active_rentals,
                "overdue_rentals": overdue_rentals,
                "returned_rentals": returned_rentals,
                "completed_rentals": completed_rentals,
                "revenue_this_month": revenue_this_month,
                "new_users": new_users,
            }
        except Exception as e:
            data = {
                "total_rentals": 0,
                "active_rentals": 0,
                "overdue_rentals": 0,
                "returned_rentals": 0,
                "completed_rentals": 0,
                "revenue_this_month": 0,
                "new_users": 0,
                "error": str(e),
            }

        return Response(data)


class RevenueReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            from apps.rentals.models import RentalOrder
            from django.db.models.functions import TruncMonth
            import datetime

            # Last 6 months of revenue
            six_months_ago = timezone.now() - timedelta(days=180)
            monthly_revenue = (
                RentalOrder.objects.filter(
                    status__in=['COMPLETED', 'RETURNED', 'ACTIVE'],
                    created_at__gte=six_months_ago
                )
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('total_amount'))
                .order_by('month')
            )

            labels = [entry['month'].strftime('%b %Y') for entry in monthly_revenue]
            values = [float(entry['revenue'] or 0) for entry in monthly_revenue]

            data = {"labels": labels, "data": values}
        except Exception as e:
            data = {"labels": [], "data": [], "error": str(e)}

        return Response(data)
