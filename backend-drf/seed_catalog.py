import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from apps.products.models import Category, Product
from apps.stores.models import Store, StoreProductStock

CATEGORIES = [
    {"name": "Cameras & Video", "icon": "Camera"},
    {"name": "Electronics & Laptops", "icon": "Laptop"},
    {"name": "Vehicles & E-Bikes", "icon": "Bike"},
    {"name": "Audio & Sound", "icon": "Speaker"},
    {"name": "Event & Outdoor Gear", "icon": "Tent"},
]

cat_map = {}
for c in CATEGORIES:
    cat, _ = Category.objects.get_or_create(name=c["name"], defaults={"icon": c["icon"]})
    cat_map[c["name"]] = cat

PRODUCTS = [
    {
        "name": "Sony FX3 Cinema Camera Kit",
        "category": cat_map["Cameras & Video"],
        "price": 2500.00,
        "security_deposit": 10000.00,
        "short_description": "Full-frame cinema line camera with XLR handle, 4K 120p recording, and low-light sensor.",
        "description": "The Sony FX3 combines the best of Alpha imaging technology with advanced cinema features for solo creators and indie film crews. Includes 24-70mm GM lens, 2x batteries, and 160GB CFexpress card.",
        "included_items": "Sony FX3 Body, XLR Handle, 24-70mm f/2.8 GM Lens, 2x NP-FZ100 Batteries, Dual Charger, 160GB Type A Card, Hard Case",
        "quantity": 6,
        "available_quantity": 6,
        "rating": 4.95,
        "review_count": 34,

    },
    {
        "name": "Apple MacBook Pro 16\" M3 Max",
        "category": cat_map["Electronics & Laptops"],
        "price": 3200.00,
        "security_deposit": 15000.00,
        "short_description": "16-core CPU, 40-core GPU, 64GB Unified Memory, 1TB SSD. Extreme performance for editing & 3D.",
        "description": "Rent the most powerful MacBook Pro for heavy 8K video editing, Unreal Engine simulations, and deep learning rendering projects.",
        "included_items": "16\" MacBook Pro Space Black, 140W USB-C Power Adapter, MagSafe 3 Cable, Tech Pouch Case",
        "quantity": 8,
        "available_quantity": 8,
        "rating": 4.90,
        "review_count": 28,

    },
    {
        "name": "Super73-RX Electric Adventure Bike",
        "category": cat_map["Vehicles & E-Bikes"],
        "price": 1800.00,
        "security_deposit": 5000.00,
        "short_description": "High-performance adventure e-bike with 75+ km range and full adjustable suspension.",
        "description": "Street-legal yet ready for rugged off-road exploration. Features an aircraft-grade aluminum alloy frame, 2000W peak motor, and iOS/Android app connectivity.",
        "included_items": "Super73-RX E-Bike, Fast Charger, High-Security Chain Lock, Smart Helmet",
        "quantity": 5,
        "available_quantity": 5,
        "rating": 4.85,
        "review_count": 42,

    },
    {
        "name": "DJI Inspire 3 Cinema Drone 8K",
        "category": cat_map["Cameras & Video"],
        "price": 8500.00,
        "security_deposit": 25000.00,
        "short_description": "Full-frame 8K/75fps ProRes RAW aerial imaging system with centimetre-level RTK positioning.",
        "description": "Masterwork aerial cinematography tool with omnidirectional obstacle sensing, 360-degree pan, and dual-operator master control.",
        "included_items": "DJI Inspire 3 Aircraft, RC Plus Remote, Zenmuse X9-8K Air Gimbal Camera, 6x TB51 Batteries, Charging Hub, Wheeled Hard Case",
        "quantity": 3,
        "available_quantity": 3,
        "rating": 5.00,
        "review_count": 19,

    },
    {
        "name": "JBL PartyBox Ultimate PA Sound System",
        "category": cat_map["Audio & Sound"],
        "price": 2200.00,
        "security_deposit": 8000.00,
        "short_description": "1100W RMS massive sound, Dolby Atmos over Wi-Fi, and dynamic multi-dimensional light show.",
        "description": "Powers massive parties, weddings, corporate events, and live gigs covering up to two basketball courts.",
        "included_items": "PartyBox Ultimate Speaker, Heavy-duty Power Cable, 2x Wireless Microphones",
        "quantity": 6,
        "available_quantity": 6,
        "rating": 4.88,
        "review_count": 22,

    },
    {
        "name": "EcoFlow Delta Pro 3600Wh Power Station",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 1600.00,
        "security_deposit": 6000.00,
        "short_description": "Portable 3.6kWh LFP battery power station with 3600W AC output for film sets & outdoor events.",
        "description": "Silent, zero-emission high-output power for cinema lights, heavy gear, food trucks, or camping setups.",
        "included_items": "Delta Pro Unit, AC Fast Charging Cable, Car Charging Cable, MC4 Solar Charging Cable",
        "quantity": 7,
        "available_quantity": 7,
        "rating": 4.92,
        "review_count": 15,
        "is_featured": False,
    },
    {
        "name": "Apple Vision Pro 512GB VR/AR Headset",
        "category": cat_map["Electronics & Laptops"],
        "price": 4500.00,
        "security_deposit": 20000.00,
        "short_description": "Spatial computing headset with Dual 4K micro-OLED displays and M2 + R1 dual-chip architecture.",
        "description": "Experience spatial computing for app development testing, architectural 3D walkthroughs, or immersive executive presentations.",
        "included_items": "Vision Pro Headset, Dual Loop Band, Battery Pack, 30W USB-C Charger, Polishing Cloth, Hard Travel Case",
        "quantity": 4,
        "available_quantity": 4,
        "rating": 4.80,
        "review_count": 11,

    }
]

created_prods = []
for p in PRODUCTS:
    prod, created = Product.objects.update_or_create(
        name=p["name"],
        defaults=p
    )
    created_prods.append(prod)
    print(f"{'Created' if created else 'Updated'} Product: {prod.name}")

# Assign stocks across all stores
stores = Store.objects.all()
for s in stores:
    for prod in created_prods:
        st, _ = StoreProductStock.objects.update_or_create(
            store=s,
            product=prod,
            defaults={
                "total_quantity": prod.quantity,
                "available_quantity": prod.available_quantity
            }
        )

print(f"\n✅ Seeded {len(created_prods)} rich products across {stores.count()} stores successfully!")
