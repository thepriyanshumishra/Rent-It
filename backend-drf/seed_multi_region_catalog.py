import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from apps.products.models import Category, Product
from apps.stores.models import Store, StoreProductStock

print("🌱 Seeding Multi-Region Stores & Radius-Based Inventory...")

CATEGORIES_DATA = [
    {"name": "Cameras & Video", "icon": "Camera"},
    {"name": "Electronics & Laptops", "icon": "Laptop"},
    {"name": "Vehicles & E-Bikes", "icon": "Bike"},
    {"name": "Audio & Sound", "icon": "Speaker"},
    {"name": "Event & Outdoor Gear", "icon": "Tent"},
    {"name": "Office & Workstation", "icon": "Briefcase"},
]

cat_map = {}
for c in CATEGORIES_DATA:
    cat, _ = Category.objects.get_or_create(name=c["name"], defaults={"icon": c["icon"]})
    cat_map[c["name"]] = cat

# 1. Clear existing StoreProductStock & Store to avoid duplicate slug constraints
StoreProductStock.objects.all().delete()
Store.objects.all().delete()

# 2. Define Stores with exact geographic coordinates relative to Kolkata (22.5726, 88.3639) and other cities
STORES_DATA = [
    {
        "code": "KOL-PS-01",
        "name": "Park Street Lifestyle Store",
        "address": "15 Park Street, Lifestyle Building, Park Street Area",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700016",
        "latitude": 22.551600,
        "longitude": 88.352400,
        "phone": "+91 98300 12345",
        "email": "parkstreet@rentit.com"
    },
    {
        "code": "KOL-SL-02",
        "name": "Salt Lake Tech Electronics Hub",
        "address": "Plot 9, Block EP, Sector 5, Salt Lake City",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700091",
        "latitude": 22.578600,
        "longitude": 88.418000,
        "phone": "+91 98300 54321",
        "email": "saltlake@rentit.com"
    },
    {
        "code": "HOW-CT-01",
        "name": "Howrah Central Logistics Depot",
        "address": "45 Grand Trunk Road, Near Howrah Station",
        "city": "Howrah",
        "state": "West Bengal",
        "pincode": "711101",
        "latitude": 22.595800,
        "longitude": 88.263600,
        "phone": "+91 98311 99887",
        "email": "howrah@rentit.com"
    },
    {
        "code": "BAR-RH-01",
        "name": "Barasat Regional Gear Center",
        "address": "12 Kachhari Road, Barasat",
        "city": "Barasat",
        "state": "West Bengal",
        "pincode": "700124",
        "latitude": 22.720000,
        "longitude": 88.480000,
        "phone": "+91 98322 11223",
        "email": "barasat@rentit.com"
    },
    {
        "code": "CHN-HS-01",
        "name": "Chandannagar Heritage Fleet Store",
        "address": "88 Strand Road, French Quarter",
        "city": "Hooghly",
        "state": "West Bengal",
        "pincode": "712136",
        "latitude": 22.866700,
        "longitude": 88.366700,
        "phone": "+91 98333 44556",
        "email": "hooghly@rentit.com"
    },
    {
        "code": "HAL-PH-01",
        "name": "Haldia Port & Industrial Hub",
        "address": "Sector 4, Haldia Township",
        "city": "Haldia",
        "state": "West Bengal",
        "pincode": "721607",
        "latitude": 22.066700,
        "longitude": 88.066700,
        "phone": "+91 98344 77889",
        "email": "haldia@rentit.com"
    },
    {
        "code": "BUR-GD-01",
        "name": "Burdwan Central Gear Depot",
        "address": "101 Grand Trunk Road, Near Court Compound",
        "city": "Burdwan",
        "state": "West Bengal",
        "pincode": "713101",
        "latitude": 23.232400,
        "longitude": 87.861500,
        "phone": "+91 98355 22334",
        "email": "burdwan@rentit.com"
    },
    {
        "code": "KGP-TD-01",
        "name": "Kharagpur Tech Equipment Store",
        "address": "IIT Campus Main Gate Road",
        "city": "Kharagpur",
        "state": "West Bengal",
        "pincode": "721302",
        "latitude": 22.346000,
        "longitude": 87.232000,
        "phone": "+91 98366 33445",
        "email": "kharagpur@rentit.com"
    },
    {
        "code": "DGP-HE-01",
        "name": "Durgapur Heavy Equipment Hub",
        "address": "City Centre Commercial Plaza",
        "city": "Durgapur",
        "state": "West Bengal",
        "pincode": "713216",
        "latitude": 23.520400,
        "longitude": 87.311900,
        "phone": "+91 98377 88990",
        "email": "durgapur@rentit.com"
    },
    {
        "code": "ASN-IH-01",
        "name": "Asansol Industrial Event Hub",
        "address": "Burnpur Road, Asansol",
        "city": "Asansol",
        "state": "West Bengal",
        "pincode": "713304",
        "latitude": 23.688900,
        "longitude": 86.966100,
        "phone": "+91 98388 99001",
        "email": "asansol@rentit.com"
    },
    {
        "code": "DEL-CP-01",
        "name": "Connaught Place Flagship Store",
        "address": "B-42 Inner Circle, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi NCR",
        "pincode": "110001",
        "latitude": 28.631500,
        "longitude": 77.216700,
        "phone": "+91 98112 34567",
        "email": "delhi@rentit.com"
    },
    {
        "code": "MUM-AW-01",
        "name": "Andheri West Media Hub",
        "address": "New Link Road, Opp Infiniti Mall",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400053",
        "latitude": 19.136300,
        "longitude": 72.827700,
        "phone": "+91 98223 45678",
        "email": "mumbai@rentit.com"
    },
    {
        "code": "BLR-KM-01",
        "name": "Koramangala Tech Hub",
        "address": "80 Feet Road, 4th Block Koramangala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.935200,
        "longitude": 77.624500,
        "phone": "+91 98445 67890",
        "email": "bengaluru@rentit.com"
    }
]

store_objs = {}
for sdata in STORES_DATA:
    st, _ = Store.objects.update_or_create(
        code=sdata["code"],
        defaults=sdata
    )
    store_objs[sdata["code"]] = st
    print(f"  🏪 Store updated: {st.name} ({st.city})")

# 3. Define Products & Assign them exclusively or primarily to specific distance stores
PRODUCTS_DATA = [
    # --- 10 KM RADIUS (Park Street & Salt Lake) ---
    {
        "name": "Sony FX3 Cinema Camera Kit",
        "category": cat_map["Cameras & Video"],
        "price": 2500.00,
        "security_deposit": 10000.00,
        "short_description": "Full-frame cinema line camera with XLR handle, 4K 120p recording.",
        "description": "Sony FX3 combines Alpha imaging with advanced cinema handle & dual CFexpress card slots.",
        "included_items": "Sony FX3 Body, 24-70mm GM Lens, XLR Handle, 2x Batteries, Charger",
        "quantity": 6,
        "store_code": "KOL-PS-01", # Park Street (2.6 km)
    },
    {
        "name": "Apple Vision Pro 512GB VR/AR Headset",
        "category": cat_map["Electronics & Laptops"],
        "price": 4500.00,
        "security_deposit": 20000.00,
        "short_description": "Spatial computing headset with Dual 4K micro-OLED displays.",
        "description": "Experience spatial computing for app development testing and architectural walkthroughs.",
        "included_items": "Vision Pro Headset, Dual Band, Battery Pack, 30W Charger, Travel Case",
        "quantity": 4,
        "store_code": "KOL-PS-01", # Park Street (2.6 km)
    },
    {
        "name": "Apple MacBook Pro 16\" M3 Max",
        "category": cat_map["Electronics & Laptops"],
        "price": 3200.00,
        "security_deposit": 15000.00,
        "short_description": "16-core CPU, 40-core GPU, 64GB Unified Memory, 1TB SSD.",
        "description": "Extreme performance laptop for heavy 8K video editing and 3D rendering.",
        "included_items": "16\" MacBook Pro, 140W USB-C Power Adapter, MagSafe 3 Cable",
        "quantity": 8,
        "store_code": "KOL-SL-02", # Salt Lake (5.6 km)
    },

    # --- 25 KM RADIUS (Howrah & Barasat) ---
    {
        "name": "Super73-RX Electric Adventure Bike",
        "category": cat_map["Vehicles & E-Bikes"],
        "price": 1800.00,
        "security_deposit": 5000.00,
        "short_description": "High-performance adventure e-bike with 75+ km range and full suspension.",
        "description": "Street-legal off-road exploration bike with 2000W peak motor and app connectivity.",
        "included_items": "Super73-RX E-Bike, Fast Charger, Chain Lock, Smart Helmet",
        "quantity": 5,
        "store_code": "HOW-CT-01", # Howrah (10.6 km)
    },
    {
        "name": "DJI Inspire 3 Cinema Drone 8K",
        "category": cat_map["Cameras & Video"],
        "price": 8500.00,
        "security_deposit": 25000.00,
        "short_description": "Full-frame 8K/75fps ProRes RAW aerial imaging system with RTK.",
        "description": "Masterwork aerial cinematography tool with omnidirectional obstacle sensing.",
        "included_items": "DJI Inspire 3 Aircraft, RC Plus Remote, Zenmuse X9-8K Air Camera, 6x TB51 Batteries",
        "quantity": 3,
        "store_code": "BAR-RH-01", # Barasat (20.5 km)
    },

    # --- 50 KM RADIUS (Hooghly / Chandannagar) ---
    {
        "name": "JBL PartyBox Ultimate PA Sound System",
        "category": cat_map["Audio & Sound"],
        "price": 2200.00,
        "security_deposit": 8000.00,
        "short_description": "1100W RMS massive sound, Dolby Atmos over Wi-Fi, and dynamic light show.",
        "description": "Powers massive parties, weddings, corporate events, and live gigs.",
        "included_items": "PartyBox Ultimate Speaker, Heavy-duty Power Cable, 2x Wireless Microphones",
        "quantity": 6,
        "store_code": "CHN-HS-01", # Chandannagar (32.8 km)
    },

    # --- 100 KM RADIUS (Haldia & Burdwan) ---
    {
        "name": "EcoFlow Delta Pro 3600Wh Power Station",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 1600.00,
        "security_deposit": 6000.00,
        "short_description": "Portable 3.6kWh LFP battery power station with 3600W AC output.",
        "description": "Silent, zero-emission high-output power for cinema lights and outdoor events.",
        "included_items": "Delta Pro Unit, AC Fast Charging Cable, Car Charging Cable",
        "quantity": 7,
        "store_code": "HAL-PH-01", # Haldia (63.5 km)
    },
    {
        "name": "RED Komodo-X 6K Cinema Camera Package",
        "category": cat_map["Cameras & Video"],
        "price": 4200.00,
        "security_deposit": 18000.00,
        "short_description": "6K Super35 global shutter camera with high frame-rate recording.",
        "description": "Next-gen Komodo sensor with locking RF mount and built-in network connectivity.",
        "included_items": "Komodo-X Body, Outrigger Handle, 2x 512GB RED PRO CFexpress Cards, V-Mount Adapter",
        "quantity": 3,
        "store_code": "BUR-GD-01", # Burdwan (88.2 km)
    },

    # --- 200 KM RADIUS (Kharagpur, Durgapur, Asansol) ---
    {
        "name": "Aputure LS 1200d Pro Daylight Cinema LED Light",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 2800.00,
        "security_deposit": 12000.00,
        "short_description": "1200W daylight point-source LED light matching 1.2kW HMI output.",
        "description": "Weather-resistant flagship cinema light for large film sets and stadium lighting.",
        "included_items": "LS 1200d Pro Lamp Head, Control Box, 3x Hyper Reflectors, Rolling Case",
        "quantity": 4,
        "store_code": "KGP-TD-01", # Kharagpur (119.5 km)
    },
    {
        "name": "Blackmagic Ursa Mini Pro 12K Camera",
        "category": cat_map["Cameras & Video"],
        "price": 5500.00,
        "security_deposit": 22000.00,
        "short_description": "12,288 x 6480 12K Super 35 sensor with 14 stops of dynamic range.",
        "description": "Revolutionary digital film camera for high-end VFX, IMAX film, and commercial production.",
        "included_items": "Ursa Mini Pro 12K Body, PL Mount, OLED EVF, V-Lock Battery Plate",
        "quantity": 2,
        "store_code": "DGP-HE-01", # Durgapur (156.4 km)
    },
    {
        "name": "Heavy Weather Waterproof Event Marquee 500-Pax Tent",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 9500.00,
        "security_deposit": 30000.00,
        "short_description": "Commercial-grade 60ft x 100ft aluminum frame marquee structure.",
        "description": "Full outdoor pavilion tent with heavy-duty PVC canopy and sidewalls for 500 guests.",
        "included_items": "Aluminum Truss Frame, White PVC Canopy, 12x Sidewalls, Ground Anchors",
        "quantity": 2,
        "store_code": "ASN-IH-01", # Asansol (188.7 km)
    },

    # --- ALL INDIA RADIUS (> 500 KM: Delhi, Mumbai, Bengaluru) ---
    {
        "name": "Hasselblad X2D 100C Medium Format Camera",
        "category": cat_map["Cameras & Video"],
        "price": 6500.00,
        "security_deposit": 35000.00,
        "short_description": "100-megapixel medium format BSI CMOS sensor with 5-axis 7-stop IBIS.",
        "description": "Unrivalled medium format detail and Hasselblad Natural Colour Solution for high fashion and art.",
        "included_items": "X2D 100C Body, XCD 55mm f/2.5 V Lens, 2x Batteries, Dual Charger",
        "quantity": 2,
        "store_code": "DEL-CP-01", # Delhi (1305 km)
    },
    {
        "name": "Phantom Flex 4K 1000fps High Speed Camera",
        "category": cat_map["Cameras & Video"],
        "price": 18000.00,
        "security_deposit": 75000.00,
        "short_description": "1,000 frames per second at full 4K resolution ultra high-speed cinema camera.",
        "description": "World-standard ultra high speed camera for liquid splashes, explosion FX, and sports commercial slow-mo.",
        "included_items": "Phantom Flex 4K 128GB Body, CineStation IV Dock, 2x 2TB CineMag IV, Power Supply",
        "quantity": 1,
        "store_code": "MUM-AW-01", # Mumbai (1660 km)
    },
    {
        "name": "NVIDIA H100 AI Supercomputer Server Workstation",
        "category": cat_map["Electronics & Laptops"],
        "price": 12500.00,
        "security_deposit": 50000.00,
        "short_description": "Liquid-cooled 8x NVIDIA H100 SXM5 80GB Tensor Core AI Server.",
        "description": "Ultra high throughput server for fine-tuning LLMs, generative AI video models, and molecular dynamics.",
        "included_items": "Liquid Cooled Server Tower, Dual 100GbE NICs, Heavy Flight Case",
        "quantity": 2,
        "store_code": "BLR-KM-01", # Bengaluru (1560 km)
    }
]

created_count = 0
for pdata in PRODUCTS_DATA:
    scode = pdata.pop("store_code")
    qty = pdata["quantity"]
    
    prod, _ = Product.objects.update_or_create(
        name=pdata["name"],
        defaults={
            **pdata,
            "available_quantity": qty,
            "is_active": True,

        }
    )
    
    target_store = store_objs[scode]
    StoreProductStock.objects.update_or_create(
        store=target_store,
        product=prod,
        defaults={
            "total_quantity": qty,
            "available_quantity": qty,
        }
    )
    created_count += 1
    print(f"  📦 Product '{prod.name}' assigned to Store '{target_store.name}' ({target_store.city})")

print(f"\n🎉 Successfully seeded {created_count} products across multi-region distance stores!")
