import os, uuid
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django.db.models import Q
from django.conf import settings
from django.core.files.storage import default_storage

from .models import Category, Product, ProductImage, RenterListingRequest
from .serializers import (
    CategorySerializer, ProductSerializer,
    ProductImageSerializer,
    RenterListingRequestSerializer
)
from apps.accounts.models import User
from apps.rentals.models import RentalOrderItem, RentalOrder

class DirectFileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        ext = os.path.splitext(file_obj.name)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        saved_path = default_storage.save(f"uploads/{filename}", file_obj)
        file_url = request.build_absolute_uri(f"/media/{saved_path}")
        
        return Response({
            'url': file_url,
            'filename': file_obj.name
        }, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).order_by('-created_at')

        category_param = self.request.query_params.get('category', None)
        if category_param:
            queryset = queryset.filter(
                Q(category__slug__icontains=category_param) |
                Q(category__name__icontains=category_param)
            )

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(short_description__icontains=search) |
                Q(description__icontains=search)
            )

        featured = self.request.query_params.get('is_featured', None)
        if featured is not None:
            is_feat = str(featured).lower() in ['true', '1']
            queryset = queryset.filter(is_featured=is_feat)

        sort = self.request.query_params.get('sort', None)
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
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

class RenterListingRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RenterListingRequestSerializer
    queryset = RenterListingRequest.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.Role.ADMIN or user.is_staff:
            return RenterListingRequest.objects.all().order_by('-created_at')
        return RenterListingRequest.objects.filter(renter=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(renter=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.approved_product:
            active_rentals = RentalOrderItem.objects.filter(
                product_id=instance.approved_product.id,
                order__status__in=['ACTIVE', 'PENDING_DELIVERY', 'CONFIRMED']
            ).exists()
            if active_rentals:
                return Response(
                    {'detail': 'Cannot unlist or delete a product that is currently on an active rental.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            instance.approved_product.is_active = False
            instance.approved_product.save()

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        req_obj = self.get_object()
        category = req_obj.category or Category.objects.first()

        condition_tag = request.data.get('admin_condition_tag', req_obj.admin_condition_tag)
        custom_condition = request.data.get('admin_custom_condition', req_obj.admin_custom_condition)
        approved_qty = int(request.data.get('approved_quantity', req_obj.quantity or 1))
        rejected_qty = int(request.data.get('rejected_quantity', 0))
        rejection_reason = request.data.get('rejection_reason', req_obj.rejection_reason or '')
        
        if condition_tag:
            req_obj.admin_condition_tag = condition_tag
        if custom_condition:
            req_obj.admin_custom_condition = custom_condition

        req_obj.approved_quantity = approved_qty
        req_obj.rejected_quantity = rejected_qty
        if rejection_reason:
            req_obj.rejection_reason = rejection_reason
        
        if approved_qty > 0 and rejected_qty > 0:
            req_obj.status = RenterListingRequest.Status.PARTIALLY_APPROVED
        else:
            req_obj.status = RenterListingRequest.Status.APPROVED

        final_condition = custom_condition if condition_tag == 'Custom' and custom_condition else condition_tag

        product = req_obj.approved_product
        if not product:
            product = Product.objects.create(
                name=req_obj.product_name,
                category=category,
                renter=req_obj.renter,
                price=req_obj.daily_price,
                security_deposit=req_obj.security_deposit or 0,
                short_description=req_obj.short_description or req_obj.product_name,
                description=req_obj.description or req_obj.short_description,
                included_items=req_obj.included_items or '',
                condition_tag=final_condition,
                quantity=approved_qty,
                available_quantity=approved_qty,
                is_active=True
            )
            
            all_imgs = []
            if req_obj.images_data and isinstance(req_obj.images_data, list):
                all_imgs.extend(req_obj.images_data)
            if req_obj.image_url and req_obj.image_url not in all_imgs:
                all_imgs.insert(0, req_obj.image_url)

            for idx, img_url in enumerate(all_imgs):
                ProductImage.objects.create(
                    product=product,
                    image_url=img_url,
                    is_primary=(idx == 0)
                )

            req_obj.approved_product = product
        else:
            product.condition_tag = final_condition
            product.quantity = approved_qty
            product.available_quantity = approved_qty
            product.price = req_obj.daily_price
            product.security_deposit = req_obj.security_deposit or 0
            product.save()

        req_obj.save()

        return Response({
            'detail': f'Listing request processed! {approved_qty} unit(s) approved & live.',
            'request': RenterListingRequestSerializer(req_obj).data,
            'product': ProductSerializer(product).data
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        req_obj = self.get_object()
        reason = request.data.get('rejection_reason', 'Failed HQ Quality Check / Invalid Purchase Bill')
        req_obj.status = RenterListingRequest.Status.REJECTED
        req_obj.rejection_reason = reason
        req_obj.approved_quantity = 0
        req_obj.rejected_quantity = req_obj.quantity or 1
        if req_obj.approved_product:
            req_obj.approved_product.is_active = False
            req_obj.approved_product.save()
        req_obj.save()

        return Response({
            'detail': 'Listing request rejected with feedback.',
            'request': RenterListingRequestSerializer(req_obj).data
        })

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
