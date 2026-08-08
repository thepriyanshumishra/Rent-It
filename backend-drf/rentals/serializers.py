from rest_framework import serializers
from .models import Rental, RentalItem, Cart, CartItem, Payment, SecurityDeposit, Charge, Settlement, Fulfillment, ReturnRecord, InspectionRecord, Damage
from catalog.serializers import ProductSerializer
from core.serializers import CustomerSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = '__all__'

class RentalItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = RentalItem
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class SecurityDepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityDeposit
        fields = '__all__'

class ChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Charge
        fields = '__all__'

class SettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = '__all__'

class DamageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Damage
        fields = '__all__'

class InspectionRecordSerializer(serializers.ModelSerializer):
    damages = DamageSerializer(many=True, read_only=True)
    class Meta:
        model = InspectionRecord
        fields = '__all__'

class RentalSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    items = RentalItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    deposits = SecurityDepositSerializer(many=True, read_only=True)
    charges = ChargeSerializer(many=True, read_only=True)
    settlement = SettlementSerializer(read_only=True)
    inspection = InspectionRecordSerializer(read_only=True)

    rentalNumber = serializers.CharField(source='rental_number')
    fulfillmentType = serializers.CharField(source='fulfillment_type')
    startDate = serializers.DateTimeField(source='start_date')
    endDate = serializers.DateTimeField(source='end_date')
    subtotalPaise = serializers.IntegerField(source='subtotal_paise')
    depositTotalPaise = serializers.IntegerField(source='deposit_total_paise')
    totalPaise = serializers.IntegerField(source='total_paise')

    class Meta:
        model = Rental
        fields = '__all__'
