from rest_framework import viewsets, permissions
from .models import Quotation, QuotationItem, BusinessOrder
from .serializers import QuotationSerializer, QuotationItemSerializer, BusinessOrderSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer

class BusinessOrderViewSet(viewsets.ModelViewSet):
    queryset = BusinessOrder.objects.all().order_by('-created_at')
    serializer_class = BusinessOrderSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
