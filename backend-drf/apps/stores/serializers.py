from rest_framework import serializers
from .models import Store, StoreProductStock
from apps.products.models import Product

class StoreProductStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = StoreProductStock
        fields = [
            'id', 'store', 'product', 'product_name', 'product_price',
            'product_image', 'category_name', 'total_quantity', 'available_quantity'
        ]

    def get_product_image(self, obj):
        first_img = obj.product.images.first()
        if not first_img:
            return None
        if hasattr(first_img, 'image_url') and first_img.image_url:
            return first_img.image_url
        if hasattr(first_img, 'image') and first_img.image:
            return first_img.image.url
        return None


class StoreSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    manager_email = serializers.CharField(source='manager.email', read_only=True)
    total_products = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'code', 'address', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'phone', 'email', 'opening_time', 'closing_time',
            'manager', 'manager_name', 'manager_email', 'is_active', 'distance_km',
            'total_products', 'created_at'
        ]

    def get_total_products(self, obj):
        return obj.stocks.filter(available_quantity__gt=0).count()


class StoreDetailSerializer(StoreSerializer):
    stocks = StoreProductStockSerializer(many=True, read_only=True)

    class Meta(StoreSerializer.Meta):
        fields = StoreSerializer.Meta.fields + ['stocks']
