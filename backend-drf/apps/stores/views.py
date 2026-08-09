import math
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Store, StoreProductStock
from .serializers import StoreSerializer, StoreDetailSerializer, StoreProductStockSerializer


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees).
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StoreDetailSerializer
        return StoreSerializer

    def get_queryset(self):
        queryset = Store.objects.filter(is_active=True)
        search = self.request.query_params.get('search', None)
        city = self.request.query_params.get('city', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search) |
                Q(address__icontains=search) |
                Q(pincode__icontains=search) |
                Q(code__icontains=search)
            )

        if city:
            queryset = queryset.filter(city__iexact=city)

        # If user is a Store Manager requesting their own store
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role in ['STAFF', 'ADMIN']:
            manage_only = self.request.query_params.get('my_store', None)
            if manage_only and self.request.user.role == 'STAFF':
                queryset = queryset.filter(manager=self.request.user)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Haversine distance computation if lat & lng are provided
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        stores_list = list(queryset)

        if lat and lng:
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                for store in stores_list:
                    store_lat = float(store.latitude)
                    store_lng = float(store.longitude)
                    store.distance_km = haversine_distance(user_lat, user_lng, store_lat, store_lng)
                
                # Sort stores by closest distance first
                stores_list.sort(key=lambda s: getattr(s, 'distance_km', 999999))
            except (ValueError, TypeError):
                for store in stores_list:
                    store.distance_km = None
        else:
            for store in stores_list:
                store.distance_km = None

        serializer = self.get_serializer(stores_list, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        """Get product inventory for this specific store."""
        store = self.get_object()
        stocks = StoreProductStock.objects.filter(store=store).select_related('product', 'product__category')
        serializer = StoreProductStockSerializer(stocks, many=True)
        return Response(serializer.data)


class StoreProductStockViewSet(viewsets.ModelViewSet):
    queryset = StoreProductStock.objects.all()
    serializer_class = StoreProductStockSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = StoreProductStock.objects.all().select_related('store', 'product')
        store_id = self.request.query_params.get('store_id', None)
        product_id = self.request.query_params.get('product_id', None)

        if store_id:
            queryset = queryset.filter(store_id=store_id)
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset
