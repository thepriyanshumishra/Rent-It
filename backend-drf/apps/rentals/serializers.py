from rest_framework import serializers
from .models import Cart, CartItem, RentalOrder, RentalOrderItem, LateFeeConfig
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'cart', 'product', 'quantity', 'start_date', 'end_date', 'pickup_slot']

    def get_product(self, obj):
        if not obj.product_id:
            return None
        try:
            return ProductSerializer(Product.objects.get(id=obj.product_id)).data
        except Product.DoesNotExist:
            return None


class CartSerializer(serializers.ModelSerializer):
    items             = CartItemSerializer(many=True, read_only=True)
    store_name        = serializers.CharField(source='store.name', read_only=True)
    total_rental_price = serializers.SerializerMethodField()
    total_deposit      = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = '__all__'

    def get_total_rental_price(self, obj):
        total = 0.0
        for item in obj.items.all():
            try:
                prod = Product.objects.get(id=item.product_id)
                days = max(1, (item.end_date - item.start_date).days) if (item.start_date and item.end_date) else 1
                total += float(prod.price or 0) * item.quantity * days
            except Exception:
                pass
        return f"{total:.2f}"

    def get_total_deposit(self, obj):
        total = 0.0
        for item in obj.items.all():
            try:
                prod = Product.objects.get(id=item.product_id)
                total += float(prod.security_deposit or 0) * item.quantity
            except Exception:
                pass
        return f"{total:.2f}"


class RentalOrderItemSerializer(serializers.ModelSerializer):
    product              = serializers.SerializerMethodField()
    product_name_display = serializers.SerializerMethodField()

    class Meta:
        model  = RentalOrderItem
        fields = [
            'id', 'order', 'product', 'product_name', 'product_name_display',
            'quantity', 'price', 'deposit', 'start_date', 'end_date',
        ]

    def get_product(self, obj):
        return ProductSerializer(obj.product).data if obj.product else None

    def get_product_name_display(self, obj):
        if obj.product_name:
            return obj.product_name
        return obj.product.name if obj.product else 'Unknown Product'


class RentalOrderSerializer(serializers.ModelSerializer):
    items               = RentalOrderItemSerializer(many=True, read_only=True)
    customer_name       = serializers.SerializerMethodField()
    customer_email      = serializers.SerializerMethodField()
    customer_phone      = serializers.SerializerMethodField()
    store_name          = serializers.CharField(source='store.name',    read_only=True)
    store_code          = serializers.CharField(source='store.code',    read_only=True)
    store_address       = serializers.CharField(source='store.address', read_only=True)
    store_city          = serializers.CharField(source='store.city',    read_only=True)
    store_phone         = serializers.CharField(source='store.phone',   read_only=True)
    store_timings       = serializers.SerializerMethodField()
    pickup_slot_display = serializers.CharField(source='get_pickup_slot_display', read_only=True)
    is_overdue          = serializers.SerializerMethodField()
    days_overdue        = serializers.SerializerMethodField()
    calculated_late_fee = serializers.SerializerMethodField()

    class Meta:
        model  = RentalOrder
        fields = '__all__'

    def get_store_timings(self, obj):
        if obj.store:
            return f"{obj.store.opening_time} – {obj.store.closing_time}"
        return "10:00 AM – 08:00 PM"

    def get_customer_name(self, obj):
        if not obj.user:
            return "Customer"
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

    def get_customer_email(self, obj):
        return obj.user.email if obj.user else ""

    def get_customer_phone(self, obj):
        return getattr(obj.user, 'phone_number', '') or ''

    def get_is_overdue(self, obj):
        return obj.is_overdue

    def get_days_overdue(self, obj):
        return obj.days_overdue

    def get_calculated_late_fee(self, obj):
        return obj.calculated_late_fee


class LateFeeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LateFeeConfig
        fields = '__all__'
