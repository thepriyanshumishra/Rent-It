from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Address, VendorProfile

User = get_user_model()


# ── Registration ──────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    first_name       = serializers.CharField(max_length=150, required=True)
    last_name        = serializers.CharField(max_length=150, required=True)
    email            = serializers.EmailField(required=True)
    phone            = serializers.CharField(max_length=20, required=True)
    password         = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        confirm_password = attrs.get('confirm_password')
        if confirm_password and attrs['password'] != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        phone = validated_data.pop('phone', '')
        email = validated_data['email']

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
            role=User.Role.CUSTOMER,
        )
        return user


class VendorRegisterSerializer(serializers.Serializer):
    first_name   = serializers.CharField(max_length=150, required=True)
    last_name    = serializers.CharField(max_length=150, required=True)
    email        = serializers.EmailField(required=True)
    phone        = serializers.CharField(max_length=20, required=True)
    company_name = serializers.CharField(max_length=255, required=True)
    gst_number   = serializers.CharField(max_length=50, required=True)
    logo         = serializers.ImageField(required=False, allow_null=True)
    password     = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        phone = validated_data['phone']

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
            role=User.Role.STAFF,
            is_staff=True,
        )

        VendorProfile.objects.create(
            user=user,
            company_name=validated_data.get('company_name', ''),
            gst_number=validated_data.get('gst_number', ''),
            logo=validated_data.get('logo', None),
        )
        return user


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    email    = serializers.CharField(required=False, allow_blank=True, default='')
    username = serializers.CharField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=True)

CustomTokenObtainPairSerializer = LoginSerializer


# ── Profile / Address ─────────────────────────────────────────────────────────

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VendorProfile
        fields = ('company_name', 'gst_number', 'logo')


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model        = Address
        fields       = '__all__'
        read_only_fields = ('user',)


class UserSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer(read_only=True)
    addresses      = AddressSerializer(many=True, read_only=True)
    phone          = serializers.CharField(source='phone_number', read_only=True)
    full_name      = serializers.SerializerMethodField()
    name           = serializers.SerializerMethodField()
    total_rentals  = serializers.SerializerMethodField()
    active_rentals = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'name', 'phone', 'phone_number', 'role',
            'is_staff', 'is_superuser',
            'vendor_profile', 'addresses',
            'total_rentals', 'active_rentals', 'date_joined',
        )
        read_only_fields = ('role', 'username', 'is_staff', 'is_superuser')

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username

    def get_name(self, obj):
        return self.get_full_name(obj)

    def get_total_rentals(self, obj):
        from apps.rentals.models import RentalOrder
        return RentalOrder.objects.filter(user=obj).count()

    def get_active_rentals(self, obj):
        from apps.rentals.models import RentalOrder
        return RentalOrder.objects.filter(
            user=obj,
            status__in=['PICKED_UP', 'LATE_RETURN'],
        ).count()


class UserProfileSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer(required=False)
    phone          = serializers.CharField(source='phone_number', required=False, allow_blank=True)

    class Meta:
        model        = User
        fields       = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'phone_number', 'role', 'is_staff', 'is_superuser',
            'vendor_profile',
        )
        read_only_fields = ('username', 'email', 'role', 'is_staff', 'is_superuser')

    def update(self, instance, validated_data):
        validated_data.pop('vendor_profile', None)  # read-only via separate endpoint
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
