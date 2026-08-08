from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, RentalOrder, RentalOrderItem
from .serializers import CartSerializer, CartItemSerializer, RentalOrderSerializer, RentalOrderItemSerializer
from apps.accounts.models import Merchant, User
from apps.products.models import Product

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += int(quantity)
            item.save()
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = CartItem.objects.get(pk=pk, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = CartItem.objects.get(pk=pk, cart=cart)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer

class RentalOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RentalOrderSerializer
    queryset = RentalOrder.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.Role.ADMIN:
            return RentalOrder.objects.all().order_by('-created_at')
        if hasattr(user, 'merchant_profile') and user.merchant_profile:
            return RentalOrder.objects.filter(merchant=user.merchant_profile).order_by('-created_at')
        return RentalOrder.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        fulfillment_type = request.data.get('fulfillment_type', RentalOrder.FulfillmentType.DOORSTEP)
        merchant_id = request.data.get('merchant_id')
        delivery_address = request.data.get('delivery_address', '')
        delivery_pincode = request.data.get('delivery_pincode', '')

        merchant = None
        if merchant_id:
            try:
                merchant = Merchant.objects.get(id=merchant_id)
            except Merchant.DoesNotExist:
                pass

        if not merchant:
            # Assign first active merchant if not specified
            merchant = Merchant.objects.filter(is_active=True).first()

        total_amount = 0.0
        for item in cart_items:
            try:
                prod = Product.objects.get(id=item.product_id)
                total_amount += float(prod.price or 0) * item.quantity
            except Product.DoesNotExist:
                pass

        order = RentalOrder.objects.create(
            user=user,
            merchant=merchant,
            fulfillment_type=fulfillment_type,
            delivery_address=delivery_address,
            delivery_pincode=delivery_pincode,
            total_amount=total_amount,
            status='ACTIVE' if fulfillment_type == RentalOrder.FulfillmentType.STORE_PICKUP else 'PENDING_DELIVERY'
        )

        for item in cart_items:
            try:
                prod = Product.objects.get(id=item.product_id)
                RentalOrderItem.objects.create(
                    order=order,
                    product_id=prod.id,
                    quantity=item.quantity,
                    price=prod.price or 0
                )
            except Product.DoesNotExist:
                pass

        # Clear cart
        cart_items.delete()

        return Response(RentalOrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='verify-pickup')
    def verify_pickup(self, request, pk=None):
        order = self.get_object()
        code = request.data.get('pickup_code')
        if order.pickup_code and order.pickup_code == str(code).strip():
            order.status = 'ACTIVE'
            order.save()
            return Response({'detail': 'Pickup verified & rental status activated!', 'order': RentalOrderSerializer(order).data})
        return Response({'detail': 'Invalid pickup code.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='process-return')
    def process_return(self, request, pk=None):
        order = self.get_object()
        notes = request.data.get('notes', '')
        damage_fee = request.data.get('damage_fee', 0)
        order.status = 'RETURNED'
        order.save()
        return Response({'detail': 'Return processed & deposit settlement logged!', 'order': RentalOrderSerializer(order).data})

class RentalOrderItemViewSet(viewsets.ModelViewSet):
    queryset = RentalOrderItem.objects.all()
    serializer_class = RentalOrderItemSerializer
