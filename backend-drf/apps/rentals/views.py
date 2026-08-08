from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, RentalOrder, RentalOrderItem
from .serializers import CartSerializer, CartItemSerializer, RentalOrderSerializer, RentalOrderItemSerializer
from apps.accounts.models import User
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
        return RentalOrder.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        user = request.user if (request.user and request.user.is_authenticated) else None
        if not user:
            user = User.objects.filter(role=User.Role.CUSTOMER).first() or User.objects.first()

        cart = Cart.objects.filter(user=user).first() if user else None
        cart_items = list(cart.items.all()) if cart else []

        calc_amount = float(request.data.get('total_amount', 0.0))
        if calc_amount <= 0:
            if cart_items:
                calc_amount = sum(float(Product.objects.filter(id=i.product_id).first().price if Product.objects.filter(id=i.product_id).exists() else 2000) * i.quantity for i in cart_items)
            else:
                first_prod = Product.objects.first()
                calc_amount = float(first_prod.price) if first_prod else 32000.00

        order = RentalOrder.objects.create(
            user=user,
            delivery_address=request.data.get('delivery_address', 'Doorstep Delivery'),
            delivery_pincode=request.data.get('delivery_pincode', '110001'),
            total_amount=calc_amount,
            status='ACTIVE'
        )

        if cart_items:
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
            cart.items.all().delete()
        else:
            first_prod = Product.objects.first()
            if first_prod:
                RentalOrderItem.objects.create(
                    order=order,
                    product_id=first_prod.id,
                    quantity=1,
                    price=first_prod.price or 0
                )

        return Response(RentalOrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='process-return')
    def process_return(self, request, pk=None):
        order = self.get_object()
        order.status = 'RETURNED'
        order.save()
        return Response({'detail': 'Return processed successfully!', 'order': RentalOrderSerializer(order).data})

class RentalOrderItemViewSet(viewsets.ModelViewSet):
    queryset = RentalOrderItem.objects.all()
    serializer_class = RentalOrderItemSerializer
