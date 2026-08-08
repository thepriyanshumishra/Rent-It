from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import AiInsightsService

class PricingInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, item_id):
        insights = AiInsightsService.generate_pricing_insights(item_id)
        return Response(insights)

class MaintenancePredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, item_id):
        prediction = AiInsightsService.generate_maintenance_prediction(item_id)
        return Response(prediction)
