from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomerProfile, Address

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    """
    Registration serializer — accepts first_name, last_name, email, phone (optional),
    password, confirm_password. Auto-generates username from email.
    Returns JWT tokens on success.
    """
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        confirm_password = attrs.get('confirm_password')
        if confirm_password and attrs['password'] != confirm_password:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        phone = validated_data.pop('phone', '')
        email = validated_data['email']

        # Auto-generate a unique username from email prefix
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
            phone_number=phone,
        )
        # Create CustomerProfile
        CustomerProfile.objects.get_or_create(user=user)
        return user

class LoginSerializer(serializers.Serializer):
    """Email + password login serializer."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


# Keep alias for compatibility
CustomTokenObtainPairSerializer = LoginSerializer


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ('date_of_birth', 'loyalty_points')
        read_only_fields = ('loyalty_points',)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)


class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    phone = serializers.CharField(source='phone_number', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'phone_number', 'role',
            'customer_profile', 'addresses'
        )
        read_only_fields = ('role', 'username')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserProfileSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(required=False)
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'phone_number', 'customer_profile')
        read_only_fields = ('username', 'email')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('customer_profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data and hasattr(instance, 'customer_profile'):
            profile = instance.customer_profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
