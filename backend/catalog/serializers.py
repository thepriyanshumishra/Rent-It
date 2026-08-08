from rest_framework import serializers
from .models import ProductCategory, Product, ProductAttribute, PriceRule, Pricelist

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class PriceRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceRule
        fields = '__all__'

class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    priceRules = PriceRuleSerializer(source='price_rules', many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    depositAmountPaise = serializers.IntegerField(source='deposit_amount_paise')
    imageUrls = serializers.SerializerMethodField()
    totalInventory = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'description', 'short_desc', 'status', 'depositAmountPaise', 'imageUrls', 'category', 'attributes', 'priceRules', 'totalInventory')

    def get_imageUrls(self, obj):
        return [obj.image_url] if obj.image_url else []

    def get_totalInventory(self, obj):
        return obj.inventory_items.exclude(status__in=['RETIRED', 'UNAVAILABLE']).count()
