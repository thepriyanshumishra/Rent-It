from rest_framework import viewsets
from .models import SecurityDeposit, DepositHistory
from .serializers import SecurityDepositSerializer, DepositHistorySerializer

class SecurityDepositViewSet(viewsets.ModelViewSet):
    queryset = SecurityDeposit.objects.all()
    serializer_class = SecurityDepositSerializer

class DepositHistoryViewSet(viewsets.ModelViewSet):
    queryset = DepositHistory.objects.all()
    serializer_class = DepositHistorySerializer
