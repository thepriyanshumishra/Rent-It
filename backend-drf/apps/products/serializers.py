from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant
from apps.pricing.models import ProductPricing, RentalPeriod

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'url', 'image_url', 'alt_text', 'is_primary')

    def get_url(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'

class PricingSerializer(serializers.ModelSerializer):
    period_name = serializers.ReadOnlyField(source='period.name')
    duration_hours = serializers.ReadOnlyField(source='period.duration_hours')

    class Meta:
        model = ProductPricing
        fields = ('id', 'period', 'period_name', 'duration_hours', 'price')

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    pricings = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_pricings(self, obj):
        pricings = ProductPricing.objects.filter(product_id=obj.id)
        return PricingSerializer(pricings, many=True).data

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            return primary.image_url or (primary.image.url if primary.image else None)
        return None
