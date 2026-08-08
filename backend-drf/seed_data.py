import os, sys, django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rentit_backend.settings')
django.setup()

from core.models import User, Customer, Address
from catalog.models import ProductCategory, Product, ProductStatus, Pricelist, PriceRule, DurationUnit
from inventory.models import InventoryItem, InventoryStatus
from rentals.models import Rental, RentalItem, RentalStatus, FulfillmentType, Payment, SecurityDeposit, DepositStatus, PaymentStatus, Fulfillment

def seed():
    print("🌱 Seeding 12 Rich Demo Products for RentIt...")

    # Clear existing data
    Rental.objects.all().delete()
    InventoryItem.objects.all().delete()
    Product.objects.all().delete()
    ProductCategory.objects.all().delete()
    User.objects.all().delete()

    # 1. Create Users
    admin_user = User.objects.create_superuser(
        username='admin@rentit.com',
        email='admin@rentit.com',
        password='admin123456',
        role=User.Role.ADMIN
    )

    customer_user = User.objects.create_user(
        username='customer@rentit.com',
        email='customer@rentit.com',
        password='customer123456',
        role=User.Role.CUSTOMER
    )

    customer_profile = Customer.objects.create(
        user=customer_user,
        name='Priyanshu Sharma',
        phone='+91 98765 43210'
    )

    Address.objects.create(
        customer=customer_profile,
        label='Main Office',
        line1='42 Tech Park, MG Road',
        city='Bengaluru',
        state='Karnataka',
        pincode='560001',
        is_default=True
    )

    # 2. Categories
    cat_av = ProductCategory.objects.create(name='Electronics & AV', slug='electronics-av', description='Professional cameras, lenses, sound systems')
    cat_tools = ProductCategory.objects.create(name='Tools & Machinery', slug='tools-machinery', description='Generators, drills, mixers, heavy equipment')
    cat_events = ProductCategory.objects.create(name='Event Supplies', slug='event-supplies', description='Canopies, sound rigs, stage setups, lighting')

    # 3. Pricelist
    pricelist = Pricelist.objects.create(name='Standard Rates', is_default=True)

    # 4. 12 Detailed Demo Products
    products_data = [
        # Electronics & AV (4)
        {
            'category': cat_av,
            'name': 'Canon EOS R6 Mark II',
            'slug': 'canon-eos-r6-mark-2',
            'short_desc': '24.2 MP Full Frame • 4K 60fps RAW • Dual Pixel AF II',
            'deposit_amount_paise': 500000, # ₹5,000
            'image_url': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
            'day_rate': 150000, # ₹1,500
            'units': 4
        },
        {
            'category': cat_av,
            'name': 'Sony FE 24-70mm f/2.8 GM II Lens',
            'slug': 'sony-24-70-gm2',
            'short_desc': 'Constant f/2.8 Aperture • Extreme Sharpness • G Master Optics',
            'deposit_amount_paise': 250000, # ₹2,500
            'image_url': 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
            'day_rate': 80000, # ₹800
            'units': 5
        },
        {
            'category': cat_av,
            'name': 'JBL EON715 Powered Loudspeaker',
            'slug': 'jbl-eon715-speaker',
            'short_desc': '1300W Peak Power • Bluetooth Audio • 15" Custom Woofer',
            'deposit_amount_paise': 300000, # ₹3,000
            'image_url': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
            'day_rate': 80000, # ₹800
            'units': 2
        },
        {
            'category': cat_av,
            'name': 'Sennheiser EW-D Wireless Mic Kit',
            'slug': 'sennheiser-ewd-mic',
            'short_desc': 'Digital Wireless System • 134 dB Dynamic Range • Handheld Transmitter',
            'deposit_amount_paise': 150000, # ₹1,500
            'image_url': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
            'day_rate': 50000, # ₹500
            'units': 6
        },

        # Tools & Machinery (4)
        {
            'category': cat_tools,
            'name': 'DeWALT DCD7781D2 Cordless Drill',
            'slug': 'dewalt-dcd7781d2-drill',
            'short_desc': '20V Max Brushless • 2 Speed • 65Nm Torque Output',
            'deposit_amount_paise': 200000, # ₹2,000
            'image_url': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
            'day_rate': 45000, # ₹450
            'units': 6
        },
        {
            'category': cat_tools,
            'name': 'Silent Heavy Duty Generator 5KVA',
            'slug': 'generator-5kva',
            'short_desc': 'Diesel 5000W Engine • Electric Key Start • Noise Enclosure',
            'deposit_amount_paise': 400000, # ₹4,000
            'image_url': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            'day_rate': 120000, # ₹1,200
            'units': 3
        },
        {
            'category': cat_tools,
            'name': 'Bosch Professional Rotary Hammer Drill',
            'slug': 'bosch-rotary-hammer',
            'short_desc': '800W Impact Motor • SDS-plus Chuck • Heavy Concrete Drilling',
            'deposit_amount_paise': 150000, # ₹1,500
            'image_url': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
            'day_rate': 40000, # ₹400
            'units': 5
        },
        {
            'category': cat_tools,
            'name': 'Makita 7" Angle Grinder 2200W',
            'slug': 'makita-angle-grinder',
            'short_desc': '2200W High Power Motor • Anti-Vibration Handle • 8500 RPM',
            'deposit_amount_paise': 120000, # ₹1,200
            'image_url': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            'day_rate': 35000, # ₹350
            'units': 4
        },

        # Event Supplies (4)
        {
            'category': cat_events,
            'name': '10x10 Premium Outdoor Event Tent',
            'slug': '10x10-premium-tent',
            'short_desc': 'Waterproof Canvas • Heavy Duty Aluminium Frame • UV Resistant',
            'deposit_amount_paise': 750000, # ₹7,500
            'image_url': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
            'day_rate': 200000, # ₹2,000
            'units': 3
        },
        {
            'category': cat_events,
            'name': 'Stage Lighting Par Can LED Rig',
            'slug': 'stage-lighting-rig',
            'short_desc': 'RGBWA+UV Color Mixing • DMX Controllable • Sound Active',
            'deposit_amount_paise': 350000, # ₹3,500
            'image_url': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
            'day_rate': 120000, # ₹1,200
            'units': 4
        },
        {
            'category': cat_events,
            'name': 'Heavy Duty Stage Trussing System',
            'slug': 'stage-trussing-system',
            'short_desc': 'Aluminum Square Trussing • 12ft Height • Quick Pins',
            'deposit_amount_paise': 500000, # ₹5,000
            'image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
            'day_rate': 180000, # ₹1,800
            'units': 2
        },
        {
            'category': cat_events,
            'name': 'Outdoor Commercial Patio Heater',
            'slug': 'patio-heater-commercial',
            'short_desc': '48,000 BTU Propane Output • Stainless Steel • Anti-Tilt Switch',
            'deposit_amount_paise': 200000, # ₹2,000
            'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            'day_rate': 60000, # ₹600
            'units': 5
        },
    ]

    created_products = []
    for p_data in products_data:
        prod = Product.objects.create(
            category=p_data['category'],
            name=p_data['name'],
            slug=p_data['slug'],
            short_desc=p_data['short_desc'],
            status=ProductStatus.ACTIVE,
            deposit_amount_paise=p_data['deposit_amount_paise'],
            image_url=p_data['image_url']
        )
        PriceRule.objects.create(
            pricelist=pricelist,
            product=prod,
            duration_unit=DurationUnit.DAY,
            duration_value=1,
            rate_paise=p_data['day_rate']
        )
        for i in range(1, p_data['units'] + 1):
            InventoryItem.objects.create(
                product=prod,
                serial_number=f"SN-{prod.id.hex[:6].upper()}-{i:02d}",
                status=InventoryStatus.AVAILABLE,
                condition='Excellent'
            )
        created_products.append(prod)

    print(f"🛍️ Successfully Created {len(created_products)} Demo Products with Physical Inventory Units!")

    # 5. Create Sample Active & Overdue Rentals
    now = datetime.now()
    r1 = Rental.objects.create(
        rental_number='RNT-202608-01001',
        customer=customer_profile,
        status=RentalStatus.ACTIVE,
        fulfillment_type=FulfillmentType.STORE_PICKUP,
        start_date=now - timedelta(days=3),
        end_date=now + timedelta(days=5),
        subtotal_paise=1200000,
        deposit_total_paise=500000,
        total_paise=1700000,
        notes='Customer picked up at counter'
    )
    RentalItem.objects.create(rental=r1, product=created_products[0], quantity=1, unit_price_paise=150000, total_paise=1200000)
    Payment.objects.create(rental=r1, amount_paise=1700000, status=PaymentStatus.SUCCEEDED, method='SIMULATED', provider_ref='SIM_1001', idempotency_key='IDEMP-1')
    SecurityDeposit.objects.create(rental=r1, amount_paise=500000, status=DepositStatus.HELD)
    Fulfillment.objects.create(rental=r1, type=FulfillmentType.STORE_PICKUP, status='COMPLETED')

    print("✅ RentIt 12-Product Database Seed Completed!")

if __name__ == '__main__':
    seed()
