from rest_framework import serializers
from .models import Cart, CartItem, RentalOrder, RentalOrderItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from apps.accounts.serializers import MerchantSerializer

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
    product = serializers.SerializerMethodField()

    class Meta:
        model = RentalOrderItem
        fields = '__all__'

    def get_product(self, obj):
        try:
            prod = Product.objects.get(id=obj.product_id)
            return ProductSerializer(prod).data
        except Product.DoesNotExist:
            return None

class RentalOrderSerializer(serializers.ModelSerializer):
    items = RentalOrderItemSerializer(many=True, read_only=True)
    merchant = MerchantSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()

    class Meta:
        model = RentalOrder
        fields = '__all__'

    def get_customer_name(self, obj):
        if not obj.user:
            return "Customer"
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

    def get_customer_email(self, obj):
        return obj.user.email if obj.user else ""

    def get_customer_phone(self, obj):
        return (obj.user.phone_number if obj.user else "") or ''
