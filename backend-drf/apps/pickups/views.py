from rest_framework import viewsets
from .models import Pickup, Return, ProductInspection, DamageReport
from .serializers import PickupSerializer, ReturnSerializer, ProductInspectionSerializer, DamageReportSerializer

class PickupViewSet(viewsets.ModelViewSet):
    queryset = Pickup.objects.all()
    serializer_class = PickupSerializer

class ReturnViewSet(viewsets.ModelViewSet):
    queryset = Return.objects.all()
    serializer_class = ReturnSerializer

class ProductInspectionViewSet(viewsets.ModelViewSet):
    queryset = ProductInspection.objects.all()
    serializer_class = ProductInspectionSerializer

class DamageReportViewSet(viewsets.ModelViewSet):
    queryset = DamageReport.objects.all()
    serializer_class = DamageReportSerializer
