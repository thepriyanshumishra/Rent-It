from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Placeholder for reporting logic
        data = {
            "total_rentals": 150,
            "active_rentals": 45,
            "revenue": 12500.50,
            "new_users": 12
        }
        return Response(data)

class RevenueReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Placeholder for reporting logic
        data = {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
            "data": [1000, 2000, 1500, 3000, 2500]
        }
        return Response(data)
