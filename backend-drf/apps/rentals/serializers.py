from rest_framework import serializers
from .models import Cart, CartItem, RentalOrder, RentalOrderItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = '__all__'

    def get_product(self, obj):
        try:
            prod = Product.objects.get(id=obj.product_id)
            return ProductSerializer(prod).data
        except Product.DoesNotExist:
            return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_rental_price = serializers.SerializerMethodField()
    total_deposit = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = '__all__'

    def get_total_rental_price(self, obj):
        total = 0.0
        for item in obj.items.all():
            try:
                prod = Product.objects.get(id=item.product_id)
                total += float(prod.price or 0) * item.quantity
            except Exception:
                pass
        return f"{total:.2f}"

    def get_total_deposit(self, obj):
        total = 0.0
        for item in obj.items.all():
            try:
                prod = Product.objects.get(id=item.product_id)
                first_pricing = prod.pricings.first()
                if first_pricing and first_pricing.security_deposit:
                    total += float(first_pricing.security_deposit) * item.quantity
            except Exception:
                pass
        return f"{total:.2f}"

class RentalOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalOrderItem
        fields = '__all__'

class RentalOrderSerializer(serializers.ModelSerializer):
    items = RentalOrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = RentalOrder
        fields = '__all__'
