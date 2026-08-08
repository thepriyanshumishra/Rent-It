from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from .models import Product, ProductCategory
from .serializers import ProductSerializer, ProductCategorySerializer
from rentals.models import RentalItem, RentalStatus

class ProductListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category_id = request.query_params.get('categoryId')
        search = request.query_params.get('search')
        
        queryset = Product.objects.filter(status='ACTIVE')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'meta': {'total': len(serializer.data), 'page': 1, 'limit': 100}
        })

class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            return Response({'success': True, 'data': ProductSerializer(product).data})
        except Product.DoesNotExist:
            return Response({'success': False, 'error': {'message': 'Product not found'}}, status=status.HTTP_404_NOT_FOUND)

class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = ProductCategory.objects.all()
        return Response({'success': True, 'data': ProductCategorySerializer(categories, many=True).data})

class AvailabilityCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        start_str = request.query_params.get('startDate')
        end_str = request.query_params.get('endDate')
        requested_qty = int(request.query_params.get('quantity', 1))

        if not start_str or not end_str:
            return Response({'success': False, 'error': {'message': 'startDate and endDate required'}}, status=status.HTTP_400_BAD_REQUEST)

        start_date = parse_datetime(start_str)
        end_date = parse_datetime(end_str)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': {'message': 'Product not found'}}, status=status.HTTP_404_NOT_FOUND)

        total_usable_units = product.inventory_items.filter(status__in=['AVAILABLE', 'RESERVED']).count()

        # Count overlapping active commitments
        overlapping_rentals_count = RentalItem.objects.filter(
            product_id=pk,
            rental__status__in=['CONFIRMED', 'SCHEDULED', 'ACTIVE', 'OVERDUE', 'PENDING_CONFIRMATION'],
            rental__start_date__lt=end_date,
            rental__end_date__gt=start_date
        ).count()

        available_units = max(0, total_usable_units - overlapping_rentals_count)
        is_available = available_units >= requested_qty

        return Response({
            'success': True,
            'data': {
                'productId': str(product.id),
                'productName': product.name,
                'totalUnits': total_usable_units,
                'occupiedUnits': overlapping_rentals_count,
                'availableUnits': available_units,
                'requestedQty': requested_qty,
                'isAvailable': is_available,
                'period': {
                    'startDate': start_date.isoformat() if start_date else start_str,
                    'endDate': end_date.isoformat() if end_date else end_str,
                }
            }
        })
