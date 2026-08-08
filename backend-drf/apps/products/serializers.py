from rest_framework import serializers
from .models import Category, Product, ProductImage, RenterListingRequest

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

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            return primary.image_url or (primary.image.url if primary.image else None)
        return None

class RenterListingRequestSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    renter_username = serializers.ReadOnlyField(source='renter.username')
    renter_email = serializers.ReadOnlyField(source='renter.email')
    renter_phone = serializers.ReadOnlyField(source='renter.phone_number')

    class Meta:
        model = RenterListingRequest
        fields = '__all__'
        read_only_fields = ('renter', 'status', 'approved_product', 'rejection_reason')
