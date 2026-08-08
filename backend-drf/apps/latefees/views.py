from rest_framework import viewsets
from .models import LateFeeConfig, LateFee
from .serializers import LateFeeConfigSerializer, LateFeeSerializer

class LateFeeConfigViewSet(viewsets.ModelViewSet):
    queryset = LateFeeConfig.objects.all()
    serializer_class = LateFeeConfigSerializer

class LateFeeViewSet(viewsets.ModelViewSet):
    queryset = LateFee.objects.all()
    serializer_class = LateFeeSerializer
