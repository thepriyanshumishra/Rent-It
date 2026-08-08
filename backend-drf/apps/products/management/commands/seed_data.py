import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.accounts.models import User
from apps.products.models import Category, Product, ProductImage, ProductVariant
from apps.pricing.models import PriceList, RentalPeriod, ProductPricing
from apps.inventory.models import InventoryItem

class Command(BaseCommand):
    help = 'Seed demo categories, products, pricing, and inventory items for RentOS'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seeding demo data...'))

        # Create Default PriceList
        price_list, _ = PriceList.objects.get_or_create(
            name='Standard Rental Rates',
            defaults={'is_active': True}
        )

        # Create Rental Periods
        periods_data = [
            ('Daily', 24),
            ('3-Day Pass', 72),
            ('Weekly', 168),
            ('Monthly', 720),
        ]
        periods = {}
        for name, duration_hours in periods_data:
            rp, _ = RentalPeriod.objects.get_or_create(
                name=name,
                defaults={'duration_hours': duration_hours}
            )
            periods[name] = rp

        # Create Categories
        categories_data = [
            {'name': 'Cameras & Video', 'icon': 'Camera', 'desc': 'Professional cinema cameras, lenses, and stabilization gear.'},
            {'name': 'Electronics', 'icon': 'Laptop', 'desc': 'High-performance MacBooks, displays, and gadgets.'},
            {'name': 'Vehicles & E-Bikes', 'icon': 'Car', 'desc': 'Electric scooters, bikes, and urban mobility.'},
            {'name': 'Audio & Sound', 'icon': 'Music', 'desc': 'PA systems, wireless mics, and DJ equipment.'},
            {'name': 'Office Furniture', 'icon': 'Sofa', 'desc': 'Ergonomic chairs, standing desks, and executive setups.'},
            {'name': 'Event & Outdoor', 'icon': 'Package', 'desc': 'Tents, projectors, lighting, and power stations.'},
        ]

        categories = {}
        for cat in categories_data:
            c, _ = Category.objects.get_or_create(
                slug=slugify(cat['name']),
                defaults={
                    'name': cat['name'],
                    'description': cat['desc'],
                    'icon': cat['icon'],
                    'is_active': True,
                }
            )
            categories[cat['name']] = c

        # Sample Products Data
        products_data = [
            {
                'category': 'Cameras & Video',
                'name': 'Sony FX3 Cinema Camera Kit',
                'short': 'Full-frame Cinema Line camera with 4K 120fps capability and XLR top handle.',
                'desc': 'The Sony FX3 Cinema Line camera brings the vision of passionate content creators to life. Featuring a full-frame 12.1MP back-illuminated Exmor R CMOS sensor, 15+ stops of dynamic range, and S-Cinetone color profile.',
                'specs': {'Sensor': 'Full-Frame 12.1MP', 'Video': '4K 120fps 10-bit 4:2:2', 'Mount': 'Sony E-mount', 'Weight': '715g'},
                'included': 'Sony FX3 Body, XLR Top Handle, 2x NP-FZ100 Batteries, Dual Charger, 160GB Tough CFexpress Type A Card, Pelican Case.',
                'terms': 'Requires ID verification and ₹15,000 security deposit. Clean return expected.',
                'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
                'daily_price': 2500, 'weekly_price': 12000, 'rating': 4.9, 'reviews': 38, 'featured': True,
                'variants': ['Body Only', 'With 24-70mm f/2.8 GM Lens']
            },
            {
                'category': 'Electronics',
                'name': 'Apple MacBook Pro 16" M3 Max',
                'short': '16-core CPU, 40-core GPU, 64GB Unified Memory, 1TB SSD Liquid Retina XDR.',
                'desc': 'Unleash extreme performance for video editing, 3D rendering, and software development with the M3 Max chip. Features a stunning 16.2-inch Liquid Retina XDR display with ProMotion up to 120Hz.',
                'specs': {'Chip': 'Apple M3 Max', 'RAM': '64GB Unified', 'Storage': '1TB NVMe SSD', 'Display': '16.2" Liquid Retina XDR'},
                'included': 'MacBook Pro 16", 140W USB-C Power Adapter, MagSafe 3 Cable, Protective Sleeve.',
                'terms': 'Data wipe mandatory upon return. Cloud lock must be signed out.',
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                'daily_price': 3000, 'weekly_price': 15000, 'rating': 5.0, 'reviews': 52, 'featured': True,
                'variants': ['Space Black - 64GB', 'Silver - 36GB']
            },
            {
                'category': 'Vehicles & E-Bikes',
                'name': 'Super73-RX Electric Adventure Bike',
                'short': 'High-performance electric motor bike with 40+ mph capability and full suspension.',
                'desc': 'The Super73-RX is the pinnacle of urban electric adventure. Built with an aircraft-grade aluminum alloy frame, inverted coil-spring fork, and a powerful 2000W peak motor.',
                'specs': {'Top Speed': '32+ mph', 'Range': '40-75 miles', 'Motor': '1200W Nominal / 2000W Peak', 'Brakes': 'Magura 4-Piston Hydraulic'},
                'included': 'Super73-RX Bike, Smart Charger, Heavy-Duty Chain Lock, Helmet, Phone Mount.',
                'terms': 'Rider must be 18+. Helmet mandatory. Helmet included.',
                'image': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
                'daily_price': 1800, 'weekly_price': 9000, 'rating': 4.8, 'reviews': 29, 'featured': True,
                'variants': ['Carmine Red', 'Rhino Gray']
            },
            {
                'category': 'Cameras & Video',
                'name': 'DJI Inspire 3 Cinema Drone',
                'short': '8K Full-Frame Cinema Drone with Zenmuse X9-8K Air Gimbal Camera.',
                'desc': 'An unprecedented all-in-one 8K camera drone designed for high-end film production. Features RTK high-precision positioning, dual-control mode, and 360-degree pan drive.',
                'specs': {'Sensor': 'Full-Frame 8K CMOS', 'Max Speed': '94 km/h', 'Flight Time': '28 mins per pair', 'Transmission': 'O3 Pro 15km'},
                'included': 'Inspire 3 Aircraft, Zenmuse X9-8K Air Camera, RC Plus Controller, 6x TB51 Batteries, Charging Hub, Rolling Case.',
                'terms': 'DGCA compliant pilot license or commercial permit required.',
                'image': 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
                'daily_price': 8000, 'weekly_price': 38000, 'rating': 4.9, 'reviews': 14, 'featured': True,
                'variants': ['Standard Master Kit', 'Dual Operator Combo']
            },
            {
                'category': 'Office Furniture',
                'name': 'Herman Miller Aeron Chair (Size B)',
                'short': 'The iconic ergonomic office chair with Pellicle suspension and PostureFit SL support.',
                'desc': 'Designed to support the human body in all working positions. Fully adjustable arms, seat angle, tilt limiter, and breathable 8Z Pellicle mesh.',
                'specs': {'Size': 'Medium (Size B)', 'Frame': 'Graphite', 'Mesh': '8Z Pellicle', 'Weight Capacity': '159 kg'},
                'included': 'Fully Assembled Ergonomic Chair.',
                'terms': 'Delivered in protective cover. Indoor office use only.',
                'image': 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80',
                'daily_price': 600, 'weekly_price': 2500, 'rating': 4.9, 'reviews': 64, 'featured': False,
                'variants': ['Graphite Frame', 'Mineral White Frame']
            },
            {
                'category': 'Audio & Sound',
                'name': 'JBL PartyBox Ultimate Wireless PA System',
                'short': '1100W RMS loud sound, multi-dimensional lightshow, Dolby Atmos support.',
                'desc': 'Fill huge spaces with superior Original JBL Pro Sound and Dolby Atmos over Wi-Fi. Features dynamic light shows synchronized to your music and dual mic/guitar inputs.',
                'specs': {'Power Output': '1100W RMS', 'Bluetooth': 'v5.3', 'Inputs': 'Dual Mic/Guitar 6.3mm, Aux, USB', 'Water Resistance': 'IPX4 Splashproof'},
                'included': 'JBL PartyBox Ultimate Speaker, AC Power Cable, Wireless Dual Microphones.',
                'terms': 'Indoor / Outdoor event use. Please adhere to local sound ordinances.',
                'image': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
                'daily_price': 2000, 'weekly_price': 8500, 'rating': 4.7, 'reviews': 41, 'featured': True,
                'variants': ['Single Unit 1100W', 'Stereo Pair (2x Speaker)']
            },
            {
                'category': 'Event & Outdoor',
                'name': 'EcoFlow Delta Pro 3.6kWh Portable Power Station',
                'short': '3600W AC Output expandable generator replacement for outdoor shoots & events.',
                'desc': 'Powers heavy-duty equipment like lights, fridges, tools, and audio systems. Features LFP battery chemistry for 3,500+ cycles to 80% capacity.',
                'specs': {'Capacity': '3600Wh', 'AC Output': '3600W (Surge 7200W)', 'Recharge Speed': '0-80% in 65 mins', 'Ports': '5x AC, 2x USB-C 100W, 2x USB-A'},
                'included': 'Delta Pro Station, AC Charging Cable, Car Charging Cable, MC4 Solar Cable.',
                'terms': 'Keep dry. Do not expose directly to heavy rain.',
                'image': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
                'daily_price': 1500, 'weekly_price': 7000, 'rating': 4.8, 'reviews': 22, 'featured': False,
                'variants': ['3.6kWh Unit', '7.2kWh Double Capacity Bundle']
            },
            {
                'category': 'Electronics',
                'name': 'Apple Vision Pro 512GB VR Headset',
                'short': 'Spatial computing headset with ultra-high-resolution 4K displays per eye.',
                'desc': 'Seamlessly blends digital content with your physical space. Features eye and hand tracking, dual-chip M2 + R1 design, and 3D spatial audio.',
                'specs': {'Storage': '512GB', 'Displays': 'Micro-OLED 23M Pixels', 'Chips': 'Apple M2 + R1', 'Battery Life': 'up to 2.5 hours'},
                'included': 'Apple Vision Pro, Solo Knit Band, Dual Loop Band, Light Seal Cushion, Battery Pack, 30W Adapter, Polishing Cloth, Case.',
                'terms': 'Clean hands requirement. Must be signed out of Apple ID before returning.',
                'image': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
                'daily_price': 4000, 'weekly_price': 20000, 'rating': 5.0, 'reviews': 18, 'featured': True,
                'variants': ['Medium Solo Band', 'Large Solo Band']
            }
        ]

        for pdata in products_data:
            cat = categories[pdata['category']]
            p, created = Product.objects.get_or_create(
                slug=slugify(pdata['name']),
                defaults={
                    'name': pdata['name'],
                    'category': cat,
                    'short_description': pdata['short'],
                    'description': pdata['desc'],
                    'specifications': pdata['specs'],
                    'included_items': pdata['included'],
                    'rental_terms': pdata['terms'],
                    'rating': pdata['rating'],
                    'review_count': pdata['reviews'],
                    'is_featured': pdata['featured'],
                    'is_active': True,
                    'price': pdata['daily_price'],
                }
            )

            # Product primary image
            ProductImage.objects.get_or_create(
                product=p,
                is_primary=True,
                defaults={'image_url': pdata['image'], 'alt_text': pdata['name']}
            )

            # Product Variants
            variants = []
            for vname in pdata['variants']:
                pv, _ = ProductVariant.objects.get_or_create(
                    product=p,
                    name=vname,
                    defaults={'sku': f"SKU-{slugify(pdata['name'])[:6]}-{slugify(vname)[:6]}".upper(), 'is_active': True}
                )
                variants.append(pv)

            # Product Pricing
            daily_period = periods['Daily']
            weekly_period = periods['Weekly']

            ProductPricing.objects.get_or_create(
                product_id=p.id,
                price_list=price_list,
                period=daily_period,
                defaults={'price': pdata['daily_price']}
            )

            ProductPricing.objects.get_or_create(
                product_id=p.id,
                price_list=price_list,
                period=weekly_period,
                defaults={'price': pdata['weekly_price']}
            )

            # Inventory items (Stock)
            if variants:
                for idx, var in enumerate(variants):
                    InventoryItem.objects.get_or_create(
                        variant=var,
                        defaults={'quantity': 10, 'reserved_quantity': 0}
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo categories, products, pricing, and stock items!'))
