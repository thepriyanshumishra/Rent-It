import os
import django
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from apps.accounts.models import User, VendorProfile
from apps.stores.models import Store, StoreProductStock
from apps.products.models import Category, Product, ProductImage
from apps.rentals.models import RentalOrder, RentalOrderItem, generate_order_number, generate_pickup_code


def setup_vendor_demo():
    print("=== SETTING UP DEMO VENDOR ACCOUNT & ORDERS ===")

    # 1. Customer User setup
    customer_user, _ = User.objects.get_or_create(
        email='customer@rentit.com',
        defaults={
            'username': 'customer',
            'first_name': 'Aarav',
            'last_name': 'Sharma',
            'phone_number': '+91 98765 43210',
            'role': User.Role.CUSTOMER
        }
    )
    customer_user.set_password('Password123!')
    customer_user.save()
    print(f"Customer user ready: {customer_user.email}")

    # 2. Main Demo Vendor User setup (vendor@rentit.com / vendor)
    vendor_user, _ = User.objects.get_or_create(
        email='vendor@rentit.com',
        defaults={
            'username': 'vendor',
            'first_name': 'ProGear',
            'last_name': 'Vendor',
            'phone_number': '+91 98300 12345',
            'role': User.Role.STAFF,
            'is_staff': True
        }
    )
    vendor_user.set_password('Password123!')
    vendor_user.role = User.Role.STAFF
    vendor_user.is_staff = True
    vendor_user.save()

    VendorProfile.objects.update_or_create(
        user=vendor_user,
        defaults={
            'company_name': 'ProGear Rentals & Audio-Visual Hub',
            'gst_number': '19AAACB1234C1Z5'
        }
    )
    print(f"Vendor user ready: {vendor_user.email} (Username: {vendor_user.username})")

    # 3. Secondary Demo Vendor User (abc@defg.com / abc1)
    abc_vendor, _ = User.objects.get_or_create(
        username='abc1',
        defaults={
            'email': 'abc@defg.com',
            'first_name': 'CP Flagship',
            'last_name': 'Vendor',
            'phone_number': '+91 98111 22233',
            'role': User.Role.STAFF,
            'is_staff': True
        }
    )
    abc_vendor.email = 'abc@defg.com'
    abc_vendor.role = User.Role.STAFF
    abc_vendor.is_staff = True
    abc_vendor.set_password('Abc@12345')
    abc_vendor.save()

    VendorProfile.objects.update_or_create(
        user=abc_vendor,
        defaults={
            'company_name': 'Connaught Place Pro Equipment Hub',
            'gst_number': '07AAACB9999C1Z9'
        }
    )
    print(f"Secondary vendor ready: {abc_vendor.email} (Username: {abc_vendor.username})")

    # 4. Connect Stores to Vendors
    kolkata_store = Store.objects.filter(code='CCU-PSK-01').first() or Store.objects.filter(city__icontains='Kolkata').first()
    delhi_store = Store.objects.filter(code='DEL-CP-01').first() or Store.objects.filter(city__icontains='Delhi').first()

    if kolkata_store:
        kolkata_store.manager = vendor_user
        kolkata_store.save()
        print(f"Assigned Store: {kolkata_store.name} to {vendor_user.username}")

    if delhi_store:
        delhi_store.manager = vendor_user
        delhi_store.save()
        # Also assign to abc_vendor for fallback
        Store.objects.filter(code='DEL-KB-02').update(manager=abc_vendor)
        print(f"Assigned Store: {delhi_store.name} to {vendor_user.username}")

    main_store = kolkata_store or delhi_store
    if not main_store:
        print("Error: No store available to attach orders.")
        return

    # 5. Populate products and store inventory for vendor
    camera_cat, _ = Category.objects.get_or_create(name='Cameras & Film Production', defaults={'icon': 'Camera'})
    audio_cat, _ = Category.objects.get_or_create(name='Audio & Sound Systems', defaults={'icon': 'Speaker'})
    it_cat, _ = Category.objects.get_or_create(name='IT & Office Electronics', defaults={'icon': 'Laptop'})
    tools_cat, _ = Category.objects.get_or_create(name='Power Tools & Construction', defaults={'icon': 'Wrench'})

    products_data = [
        {
            'name': 'Sony Alpha A7 IV Mirrorless Camera Body',
            'cat': camera_cat,
            'price': 1800.00,
            'deposit': 15000.00,
            'short_desc': '33MP Full-Frame hybrid mirrorless camera with 4K60 video recording.',
            'desc': 'Professional 33MP full-frame camera body ideal for wedding photography, indie films, and event videography. Clean sensor, 2x batteries included.',
            'items': '2x NP-FZ100 Batteries, 128GB Pro SD Card, Dual Charger, Camera Strap, Soft Bag',
            'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'JBL PartyBox 310 Portable Speaker',
            'cat': audio_cat,
            'price': 1100.00,
            'deposit': 4400.00,
            'short_desc': '240W high-power portable Bluetooth party speaker with light show.',
            'desc': 'Massive 240-watt output with dual mic/guitar inputs, built-in light effects, and 18-hour battery life. Perfect for outdoor events and parties.',
            'items': 'Power Cable, Auxiliary Cable, Wireless Mic Transmitter',
            'image': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Apple MacBook Pro 16" M3 Max Workstation',
            'cat': it_cat,
            'price': 2500.00,
            'deposit': 20000.00,
            'short_desc': '36GB Unified Memory, 1TB SSD ultimate video editing laptop.',
            'desc': 'M3 Max 16-core CPU / 40-core GPU beast configured for 8K video editing, 3D rendering, and live audio processing.',
            'items': 'MagSafe 140W Charger, USB-C Cable, Padded Sleeve, Wireless Mouse',
            'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'DJI Mavic 3 Pro Cine Drone Combo',
            'cat': camera_cat,
            'price': 3200.00,
            'deposit': 25000.00,
            'short_desc': 'Tri-camera 4/3 CMOS Hasselblad drone with Apple ProRes support.',
            'desc': 'Industry-standard aerial photography drone with 43-min flight time, 15km transmission, and multi-lens camera system.',
            'items': '3x Intelligent Flight Batteries, RC Pro Controller, ND Filter Set, Hard Case, Spare Propellers',
            'image': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Honda EU2200i Portable Silent Generator',
            'cat': tools_cat,
            'price': 1500.00,
            'deposit': 6000.00,
            'short_desc': '2200W ultra-quiet inverter generator for outdoor film sets and events.',
            'desc': 'Operates at 48 to 57 dBA, fuel-efficient inverter technology for sensitive electronics like laptops, lights, and audio mixers.',
            'items': 'Full Fuel Tank, Oil Funnel, Ground Wire, User Manual',
            'image': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
        }
    ]

    created_products = []
    for pd in products_data:
        prod, _ = Product.objects.get_or_create(
            name=pd['name'],
            category=pd['cat'],
            defaults={
                'owner': vendor_user,
                'price': pd['price'],
                'security_deposit': pd['deposit'],
                'short_description': pd['short_desc'],
                'description': pd['desc'],
                'included_items': pd['items'],
                'quantity': 5,
                'available_quantity': 4,
                'rating': 4.85,
                'review_count': 19,
                'is_active': True
            }
        )
        ProductImage.objects.get_or_create(
            product=prod,
            image_url=pd['image'],
            defaults={'alt_text': pd['name'], 'is_primary': True}
        )
        StoreProductStock.objects.update_or_create(
            store=main_store,
            product=prod,
            defaults={'total_quantity': 5, 'available_quantity': 4}
        )
        created_products.append(prod)

    print(f"Products & stock created under store '{main_store.name}'")

    # 6. Delete old demo orders for these test numbers to keep clean state
    RentalOrder.objects.filter(order_number__in=['RNT-100201', 'RNT-100202', 'RNT-100203', 'RNT-100204']).delete()

    today = date.today()

    # -------------------------------------------------------------
    # DEMO ORDER 1: RESERVED (COUNTER PICKUP VERIFICATION HANDOVER)
    # -------------------------------------------------------------
    o1 = RentalOrder.objects.create(
        order_number='RNT-100201',
        user=customer_user,
        store=main_store,
        status=RentalOrder.Status.RESERVED,
        pickup_slot=RentalOrder.PickupSlot.MORNING_10_1,
        pickup_code='PKP-4829',
        delivery_method=RentalOrder.DeliveryMethod.STORE_PICKUP,
        rental_start_date=today,
        rental_end_date=today + timedelta(days=2),
        total_amount=18600.00,
        deposit_amount=15000.00,
        payment_status=RentalOrder.PaymentStatus.PAID,
        deposit_status=RentalOrder.DepositStatus.HELD
    )
    RentalOrderItem.objects.create(
        order=o1,
        product=created_products[0],
        product_name=created_products[0].name,
        quantity=1,
        price=3600.00,
        deposit=15000.00,
        start_date=today.isoformat(),
        end_date=(today + timedelta(days=2)).isoformat()
    )
    print(f"Created Order 1 [RESERVED]: {o1.order_number} | Pickup Code: {o1.pickup_code}")

    # -------------------------------------------------------------
    # DEMO ORDER 2: PICKED_UP / ACTIVE (READY FOR RETURN INSPECTION)
    # -------------------------------------------------------------
    o2 = RentalOrder.objects.create(
        order_number='RNT-100202',
        user=customer_user,
        store=main_store,
        status=RentalOrder.Status.PICKED_UP,
        pickup_slot=RentalOrder.PickupSlot.AFTERNOON_2_6,
        pickup_code='PKP-9102',
        delivery_method=RentalOrder.DeliveryMethod.STORE_PICKUP,
        rental_start_date=today - timedelta(days=1),
        rental_end_date=today + timedelta(days=2),
        picked_up_at=timezone.now() - timedelta(days=1),
        total_amount=50000.00,
        deposit_amount=33800.00,
        payment_status=RentalOrder.PaymentStatus.PAID,
        deposit_status=RentalOrder.DepositStatus.HELD
    )
    RentalOrderItem.objects.create(
        order=o2,
        product=created_products[1],
        product_name=created_products[1].name,
        quantity=2,
        price=6600.00,
        deposit=8800.00,
        start_date=(today - timedelta(days=1)).isoformat(),
        end_date=(today + timedelta(days=2)).isoformat()
    )
    RentalOrderItem.objects.create(
        order=o2,
        product=created_products[3],
        product_name=created_products[3].name,
        quantity=1,
        price=9600.00,
        deposit=25000.00,
        start_date=(today - timedelta(days=1)).isoformat(),
        end_date=(today + timedelta(days=2)).isoformat()
    )
    print(f"Created Order 2 [ACTIVE / PICKED_UP]: {o2.order_number} | Pickup Code: {o2.pickup_code}")

    # -------------------------------------------------------------
    # DEMO ORDER 3: LATE_RETURN (OVERDUE RENTAL FOR LATE FEES)
    # -------------------------------------------------------------
    o3 = RentalOrder.objects.create(
        order_number='RNT-100203',
        user=customer_user,
        store=main_store,
        status=RentalOrder.Status.LATE_RETURN,
        pickup_slot=RentalOrder.PickupSlot.EVENING_6_9,
        pickup_code='PKP-3314',
        delivery_method=RentalOrder.DeliveryMethod.STORE_PICKUP,
        rental_start_date=today - timedelta(days=5),
        rental_end_date=today - timedelta(days=2),
        picked_up_at=timezone.now() - timedelta(days=5),
        total_amount=9000.00,
        deposit_amount=6000.00,
        late_fee_amount=400.00,
        late_fee_days=2,
        payment_status=RentalOrder.PaymentStatus.PAID,
        deposit_status=RentalOrder.DepositStatus.HELD
    )
    RentalOrderItem.objects.create(
        order=o3,
        product=created_products[4],
        product_name=created_products[4].name,
        quantity=1,
        price=3000.00,
        deposit=6000.00,
        start_date=(today - timedelta(days=5)).isoformat(),
        end_date=(today - timedelta(days=2)).isoformat()
    )
    print(f"Created Order 3 [LATE_RETURN / OVERDUE]: {o3.order_number} | Pickup Code: {o3.pickup_code}")

    # -------------------------------------------------------------
    # DEMO ORDER 4: RETURNED (READY FOR DEPOSIT REFUND / SETTLEMENT)
    # -------------------------------------------------------------
    o4 = RentalOrder.objects.create(
        order_number='RNT-100204',
        user=customer_user,
        store=main_store,
        status=RentalOrder.Status.RETURNED,
        pickup_slot=RentalOrder.PickupSlot.MORNING_10_1,
        pickup_code='PKP-7721',
        delivery_method=RentalOrder.DeliveryMethod.STORE_PICKUP,
        rental_start_date=today - timedelta(days=6),
        rental_end_date=today - timedelta(days=1),
        picked_up_at=timezone.now() - timedelta(days=6),
        returned_at=timezone.now() - timedelta(hours=3),
        condition_on_return='GOOD',
        inspection_notes='Item returned in pristine condition with all accessories intact.',
        total_amount=32500.00,
        deposit_amount=20000.00,
        payment_status=RentalOrder.PaymentStatus.PAID,
        deposit_status=RentalOrder.DepositStatus.HELD
    )
    RentalOrderItem.objects.create(
        order=o4,
        product=created_products[2],
        product_name=created_products[2].name,
        quantity=1,
        price=12500.00,
        deposit=20000.00,
        start_date=(today - timedelta(days=6)).isoformat(),
        end_date=(today - timedelta(days=1)).isoformat()
    )
    print(f"Created Order 4 [RETURNED / PENDING SETTLEMENT]: {o4.order_number} | Pickup Code: {o4.pickup_code}")

    print("\n==========================================")
    print("ALL DEMO ORDERS & VENDOR LISTINGS SET UP!")
    print("==========================================")


if __name__ == '__main__':
    setup_vendor_demo()
