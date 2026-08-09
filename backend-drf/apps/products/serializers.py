from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = '__all__'

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ('id', 'url', 'image_url', 'alt_text', 'is_primary')

    def get_url(self, obj):
        return obj.image_url or None


class ProductSerializer(serializers.ModelSerializer):
    images        = ProductImageSerializer(many=True, read_only=True)
    category      = CategorySerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = '__all__'

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not primary:
            return None
        if hasattr(primary, 'image_url') and primary.image_url:
            return primary.image_url
        if hasattr(primary, 'image') and primary.image:
            return primary.image.url
        return None
