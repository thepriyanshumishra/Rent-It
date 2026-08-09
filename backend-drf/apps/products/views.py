import os, uuid
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django.db.models import Q
from django.core.files.storage import default_storage

from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer
from apps.rentals.models import RentalOrderItem


class DirectFileUploadView(APIView):
    parser_classes    = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        ext      = os.path.splitext(file_obj.name)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        saved    = default_storage.save(f"uploads/{filename}", file_obj)
        url      = request.build_absolute_uri(f"/media/{saved}")

        return Response({'url': url, 'filename': file_obj.name}, status=status.HTTP_201_CREATED)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field     = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset         = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field     = 'slug'

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).order_by('-created_at')

        # Vendor sees only their store's products
        user       = self.request.user
        my_listings = self.request.query_params.get('my_listings')
        if my_listings and user.is_authenticated and getattr(user, 'role', None) == 'STAFF':
            managed_store_ids = user.managed_stores.values_list('id', flat=True)
            queryset = queryset.filter(
                store_stocks__store_id__in=managed_store_ids
            ).distinct()

        # Category filter
        category_param = self.request.query_params.get('category')
        if category_param:
            queryset = queryset.filter(
                Q(category__slug__icontains=category_param) |
                Q(category__name__icontains=category_param)
            )

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(short_description__icontains=search) |
                Q(description__icontains=search)
            )

        # Sort
        sort = self.request.query_params.get('sort')
        if sort == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort == 'popular':
            queryset = queryset.order_by('-rating', '-review_count')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        active_rentals = RentalOrderItem.objects.filter(
            product=instance,
            order__status__in=['RESERVED', 'PICKED_UP', 'ACTIVE', 'LATE_RETURN'],
        ).exists()

        if active_rentals:
            return Response(
                {'detail': 'Cannot delete product while active rentals are in progress.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_active = False
        instance.save()
        return Response({'detail': 'Product listing removed successfully.'}, status=status.HTTP_200_OK)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset         = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
