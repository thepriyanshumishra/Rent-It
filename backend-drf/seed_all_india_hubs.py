import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from apps.products.models import Category, Product
from apps.stores.models import Store, StoreProductStock

print("🌱 Seeding Comprehensive All-India Multi-Hub Store Network...")

# 1. Categories
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

# 2. Clear old stocks & stores to prevent duplicate constraints
StoreProductStock.objects.all().delete()
Store.objects.all().delete()

# 3. Comprehensive Indian Stores Network with Exact GPS Coordinates
STORES_DATA = [
    # ── PUNE & MAHARASHTRA REGION ─────────────────────────
    {
        "code": "PUN-CP-01",
        "name": "Pune Camp Central Fleet Store",
        "address": "45 MG Road, Camp, Pune, Maharashtra 411001",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001",
        "latitude": 18.516700,
        "longitude": 73.873500,
        "phone": "+91 98220 11223",
        "email": "punecamp@rentit.com"
    },
    {
        "code": "PUN-PC-02",
        "name": "Pimpri-Chinchwad Tech Hub",
        "address": "Old Mumbai-Pune Highway, Chinchwad, Pune, Maharashtra 411019",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411019",
        "latitude": 18.629800,
        "longitude": 73.799700,
        "phone": "+91 98220 33445",
        "email": "pimpri@rentit.com"
    },
    {
        "code": "PUN-HJ-03",
        "name": "Hinjewadi IT Park Gear Depot",
        "address": "Phase 1 Main Road, Hinjewadi, Pune, Maharashtra 411057",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411057",
        "latitude": 18.591200,
        "longitude": 73.738900,
        "phone": "+91 98220 55667",
        "email": "hinjewadi@rentit.com"
    },
    {
        "code": "LNV-OA-01",
        "name": "Lonavala Outdoor & Adventure Hub",
        "address": "Kumar Resort Road, Lonavala, Maharashtra 410401",
        "city": "Lonavala",
        "state": "Maharashtra",
        "pincode": "410401",
        "latitude": 18.755700,
        "longitude": 73.409100,
        "phone": "+91 98220 77889",
        "email": "lonavala@rentit.com"
    },
    {
        "code": "NVM-VS-01",
        "name": "Navi Mumbai Vashi Logistics Center",
        "address": "Sector 17, Vashi, Navi Mumbai, Maharashtra 400703",
        "city": "Navi Mumbai",
        "state": "Maharashtra",
        "pincode": "400703",
        "latitude": 19.077000,
        "longitude": 72.998000,
        "phone": "+91 98220 99001",
        "email": "vashi@rentit.com"
    },
    {
        "code": "MUM-BK-01",
        "name": "Bandra Kurla Complex (BKC) Flagship",
        "address": "G Block, BKC, Bandra East, Mumbai, Maharashtra 400051",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400051",
        "latitude": 19.065700,
        "longitude": 72.868700,
        "phone": "+91 98200 12345",
        "email": "bkc@rentit.com"
    },
    {
        "code": "MUM-AW-01",
        "name": "Andheri West Media Hub",
        "address": "New Link Road, Andheri West, Mumbai, Maharashtra 400053",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400053",
        "latitude": 19.136300,
        "longitude": 72.827700,
        "phone": "+91 98200 54321",
        "email": "andheri@rentit.com"
    },
    {
        "code": "NSK-WC-01",
        "name": "Nashik Wine Capital Gear Depot",
        "address": "Gangapur Road, Nashik, Maharashtra 422013",
        "city": "Nashik",
        "state": "Maharashtra",
        "pincode": "422013",
        "latitude": 19.997500,
        "longitude": 73.789800,
        "phone": "+91 98200 99887",
        "email": "nashik@rentit.com"
    },

    # ── KOLKATA & WEST BENGAL REGION ──────────────────────
    {
        "code": "KOL-PS-01",
        "name": "Park Street Lifestyle Store",
        "address": "15 Park Street, Lifestyle Building, Kolkata, West Bengal 700016",
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
        "address": "Sector 5, Salt Lake City, Kolkata, West Bengal 700091",
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
        "address": "45 Grand Trunk Road, Howrah, West Bengal 711101",
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
        "address": "12 Kachhari Road, Barasat, West Bengal 700124",
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
        "address": "88 Strand Road, Hooghly, West Bengal 712136",
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
        "address": "Sector 4, Haldia Township, West Bengal 721607",
        "city": "Haldia",
        "state": "West Bengal",
        "pincode": "721607",
        "latitude": 22.066700,
        "longitude": 88.066700,
        "phone": "+91 98344 77889",
        "email": "haldia@rentit.com"
    },
    {
        "code": "DGP-HE-01",
        "name": "Durgapur Heavy Equipment Hub",
        "address": "City Centre Plaza, Durgapur, West Bengal 713216",
        "city": "Durgapur",
        "state": "West Bengal",
        "pincode": "713216",
        "latitude": 23.520400,
        "longitude": 87.311900,
        "phone": "+91 98377 88990",
        "email": "durgapur@rentit.com"
    },

    # ── DELHI NCR & NORTH REGION ──────────────────────────
    {
        "code": "DEL-CP-01",
        "name": "Connaught Place Flagship Store",
        "address": "B-42 Inner Circle, Connaught Place, New Delhi 110001",
        "city": "New Delhi",
        "state": "Delhi NCR",
        "pincode": "110001",
        "latitude": 28.631500,
        "longitude": 77.216700,
        "phone": "+91 98112 34567",
        "email": "delhi@rentit.com"
    },
    {
        "code": "GUR-CY-01",
        "name": "Gurugram Cyber City Tech Depot",
        "address": "DLF Cyber City, Phase 2, Gurugram, Haryana 122002",
        "city": "Gurugram",
        "state": "Haryana",
        "pincode": "122002",
        "latitude": 28.495000,
        "longitude": 77.089000,
        "phone": "+91 98112 99001",
        "email": "gurugram@rentit.com"
    },
    {
        "code": "NOI-SEC-01",
        "name": "Noida Sector 62 Media Center",
        "address": "C-20, Sector 62, Noida, Uttar Pradesh 201309",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "pincode": "201309",
        "latitude": 28.627000,
        "longitude": 77.372000,
        "phone": "+91 98112 88776",
        "email": "noida@rentit.com"
    },

    # ── BENGALURU & SOUTH REGION ──────────────────────────
    {
        "code": "BLR-KM-01",
        "name": "Koramangala Tech Hub",
        "address": "80 Feet Road, 4th Block Koramangala, Bengaluru, Karnataka 560034",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.935200,
        "longitude": 77.624500,
        "phone": "+91 98445 67890",
        "email": "bengaluru@rentit.com"
    },
    {
        "code": "BLR-IN-02",
        "name": "Indiranagar Media Depot",
        "address": "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "latitude": 12.978400,
        "longitude": 77.640800,
        "phone": "+91 98445 11223",
        "email": "indiranagar@rentit.com"
    }
]

store_objs = {}
for sdata in STORES_DATA:
    st = Store.objects.create(**sdata)
    store_objs[sdata["code"]] = st
    print(f"  🏪 Store created: {st.name} ({st.city})")

# 4. Products Data & Store Distribution
PRODUCTS_DATA = [
    # --- PUNE 10 KM RADIUS ---
    {
        "name": "Sony FX3 Cinema Camera Kit",
        "category": cat_map["Cameras & Video"],
        "price": 2500.00,
        "security_deposit": 10000.00,
        "short_description": "Full-frame cinema line camera with XLR handle, 4K 120p recording.",
        "description": "Sony FX3 combines Alpha imaging with advanced cinema handle & dual CFexpress card slots.",
        "included_items": "Sony FX3 Body, 24-70mm GM Lens, XLR Handle, 2x Batteries, Charger",
        "quantity": 6,
        "store_code": "PUN-CP-01", # Pune Camp (2.1 km from Pune)
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
        "store_code": "PUN-CP-01", # Pune Camp (2.1 km from Pune)
    },

    # --- PUNE 25 KM RADIUS ---
    {
        "name": "Apple MacBook Pro 16\" M3 Max",
        "category": cat_map["Electronics & Laptops"],
        "price": 3200.00,
        "security_deposit": 15000.00,
        "short_description": "16-core CPU, 40-core GPU, 64GB Unified Memory, 1TB SSD.",
        "description": "Extreme performance laptop for heavy 8K video editing and 3D rendering.",
        "included_items": "16\" MacBook Pro, 140W USB-C Power Adapter, MagSafe 3 Cable",
        "quantity": 8,
        "store_code": "PUN-PC-02", # Pimpri-Chinchwad (13.4 km from Pune)
    },
    {
        "name": "Super73-RX Electric Adventure Bike",
        "category": cat_map["Vehicles & E-Bikes"],
        "price": 1800.00,
        "security_deposit": 5000.00,
        "short_description": "High-performance adventure e-bike with 75+ km range and full suspension.",
        "description": "Street-legal off-road exploration bike with 2000W peak motor and app connectivity.",
        "included_items": "Super73-RX E-Bike, Fast Charger, Chain Lock, Smart Helmet",
        "quantity": 5,
        "store_code": "PUN-HJ-03", # Hinjewadi (14.8 km from Pune)
    },

    # --- PUNE 100 KM RADIUS ---
    {
        "name": "EcoFlow Delta Pro 3600Wh Power Station",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 1600.00,
        "security_deposit": 6000.00,
        "short_description": "Portable 3.6kWh LFP battery power station with 3600W AC output.",
        "description": "Silent, zero-emission high-output power for cinema lights and outdoor events.",
        "included_items": "Delta Pro Unit, AC Fast Charging Cable, Car Charging Cable",
        "quantity": 7,
        "store_code": "LNV-OA-01", # Lonavala (53.8 km from Pune)
    },
    {
        "name": "JBL PartyBox Ultimate PA Sound System",
        "category": cat_map["Audio & Sound"],
        "price": 2200.00,
        "security_deposit": 8000.00,
        "short_description": "1100W RMS massive sound, Dolby Atmos over Wi-Fi, and dynamic light show.",
        "description": "Powers massive parties, weddings, corporate events, and live gigs.",
        "included_items": "PartyBox Ultimate Speaker, Heavy-duty Power Cable, 2x Wireless Microphones",
        "quantity": 6,
        "store_code": "LNV-OA-01", # Lonavala (53.8 km from Pune)
    },

    # --- PUNE 200 KM RADIUS ---
    {
        "name": "RED Komodo-X 6K Cinema Camera Package",
        "category": cat_map["Cameras & Video"],
        "price": 4200.00,
        "security_deposit": 18000.00,
        "short_description": "6K Super35 global shutter camera with high frame-rate recording.",
        "description": "Next-gen Komodo sensor with locking RF mount and built-in network connectivity.",
        "included_items": "Komodo-X Body, Outrigger Handle, 2x 512GB RED PRO CFexpress Cards, V-Mount Adapter",
        "quantity": 3,
        "store_code": "NVM-VS-01", # Navi Mumbai (111.2 km from Pune)
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
        "store_code": "NVM-VS-01", # Navi Mumbai (111.2 km from Pune)
    },
    {
        "name": "Aputure LS 1200d Pro Daylight Cinema LED Light",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 2800.00,
        "security_deposit": 12000.00,
        "short_description": "1200W daylight point-source LED light matching 1.2kW HMI output.",
        "description": "Weather-resistant flagship cinema light for large film sets and stadium lighting.",
        "included_items": "LS 1200d Pro Lamp Head, Control Box, 3x Hyper Reflectors, Rolling Case",
        "quantity": 4,
        "store_code": "MUM-BK-01", # BKC Mumbai (123.5 km from Pune)
    },
    {
        "name": "Phantom Flex 4K 1000fps High Speed Camera",
        "category": cat_map["Cameras & Video"],
        "price": 18000.00,
        "security_deposit": 75000.00,
        "short_description": "1,000 frames per second at full 4K resolution ultra high-speed cinema camera.",
        "description": "World-standard ultra high speed camera for liquid splashes and commercial slow-mo.",
        "included_items": "Phantom Flex 4K 128GB Body, CineStation IV Dock, 2x 2TB CineMag IV",
        "quantity": 1,
        "store_code": "MUM-AW-01", # Andheri West Mumbai (128.1 km from Pune)
    },
    {
        "name": "Heavy Weather Waterproof Event Marquee 500-Pax Tent",
        "category": cat_map["Event & Outdoor Gear"],
        "price": 9500.00,
        "security_deposit": 30000.00,
        "short_description": "Commercial-grade 60ft x 100ft aluminum frame marquee structure.",
        "description": "Full outdoor pavilion tent with heavy-duty PVC canopy for 500 guests.",
        "included_items": "Aluminum Truss Frame, White PVC Canopy, 12x Sidewalls, Ground Anchors",
        "quantity": 2,
        "store_code": "NSK-WC-01", # Nashik (165.2 km from Pune)
    },

    # --- OTHER REGIONS (Kolkata, Delhi, Bengaluru) ---
    {
        "name": "Hasselblad X2D 100C Medium Format Camera",
        "category": cat_map["Cameras & Video"],
        "price": 6500.00,
        "security_deposit": 35000.00,
        "short_description": "100-megapixel medium format BSI CMOS sensor with 5-axis 7-stop IBIS.",
        "description": "Unrivalled medium format detail and Hasselblad Natural Colour Solution.",
        "included_items": "X2D 100C Body, XCD 55mm f/2.5 V Lens, 2x Batteries, Dual Charger",
        "quantity": 2,
        "store_code": "DEL-CP-01", # Delhi
    },
    {
        "name": "NVIDIA H100 AI Supercomputer Server Workstation",
        "category": cat_map["Electronics & Laptops"],
        "price": 12500.00,
        "security_deposit": 50000.00,
        "short_description": "Liquid-cooled 8x NVIDIA H100 SXM5 80GB Tensor Core AI Server.",
        "description": "Ultra high throughput server for fine-tuning LLMs and generative AI video models.",
        "included_items": "Liquid Cooled Server Tower, Dual 100GbE NICs, Heavy Flight Case",
        "quantity": 2,
        "store_code": "BLR-KM-01", # Bengaluru
    },
    {
        "name": "ARRI Alexa Mini LF Cinema Camera Package",
        "category": cat_map["Cameras & Video"],
        "price": 14000.00,
        "security_deposit": 60000.00,
        "short_description": "Large format 4.5K ARRI A2X sensor with iconic ARRI color science.",
        "description": "Industry gold-standard feature film camera system for Hollywood cinema.",
        "included_items": "Alexa Mini LF Body, MVF-2 Viewfinder, 3x 1TB Codex Compact Drives",
        "quantity": 1,
        "store_code": "GUR-CY-01", # Gurugram
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
