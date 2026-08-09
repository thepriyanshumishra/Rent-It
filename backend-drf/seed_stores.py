import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from apps.stores.models import Store, StoreProductStock
from apps.products.models import Product
from apps.accounts.models import User

# Ensure a staff user exists as a store manager demo
manager_user, _ = User.objects.get_or_create(
    username="delhi_manager",
    defaults={
        "email": "delhi.store@rentit.com",
        "first_name": "Rajesh",
        "last_name": "Kumar",
        "role": "STAFF",
        "is_staff": True
    }
)
if not manager_user.has_usable_password():
    manager_user.set_password("password123")
    manager_user.save()

STORES = [
    {
        "name": "Connaught Place Hub (Flagship)",
        "code": "DEL-CP-01",
        "address": "B-42, Inner Circle, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "phone": "+91 98112 34567",
        "email": "delhi.cp@rentit.com",
        "opening_time": "09:30 AM",
        "closing_time": "08:30 PM",
        "manager": manager_user,
    },
    {
        "name": "Saket District Centre Store",
        "code": "DEL-SK-02",
        "address": "Unit 104, Select Citywalk Mall, Saket",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110017",
        "latitude": 28.5284,
        "longitude": 77.2188,
        "phone": "+91 98112 88990",
        "email": "delhi.saket@rentit.com",
        "opening_time": "10:00 AM",
        "closing_time": "09:00 PM",
    },
    {
        "name": "Andheri West Media Hub",
        "code": "BOM-AW-01",
        "address": "Ground Floor, Crystal Plaza, Link Road, Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400053",
        "latitude": 19.1363,
        "longitude": 72.8277,
        "phone": "+91 98201 12345",
        "email": "mumbai.andheri@rentit.com",
        "opening_time": "10:00 AM",
        "closing_time": "08:30 PM",
    },
    {
        "name": "Bandra Kurla Complex (BKC)",
        "code": "BOM-BK-02",
        "address": "G-Block, Bandra Kurla Complex",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400051",
        "latitude": 19.0657,
        "longitude": 72.8687,
        "phone": "+91 98201 67890",
        "email": "mumbai.bkc@rentit.com",
        "opening_time": "09:00 AM",
        "closing_time": "08:00 PM",
    },
    {
        "name": "Koramangala Tech Hub",
        "code": "BLR-KM-01",
        "address": "80 Feet Road, 4th Block, Koramangala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "phone": "+91 98450 11223",
        "email": "blr.kora@rentit.com",
        "opening_time": "10:00 AM",
        "closing_time": "09:00 PM",
    },
    {
        "name": "Park Street Lifestyle Store",
        "code": "CCU-PS-01",
        "address": "18 Park Street, Mullick Bazar",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700016",
        "latitude": 22.5516,
        "longitude": 88.3524,
        "phone": "+91 98300 44556",
        "email": "kolkata.park@rentit.com",
        "opening_time": "10:30 AM",
        "closing_time": "08:00 PM",
    }
]

created_stores = []
for data in STORES:
    store, created = Store.objects.update_or_create(
        code=data["code"],
        defaults=data
    )
    created_stores.append(store)
    print(f"{'Created' if created else 'Updated'} Store: {store.name} ({store.city})")

# Stock all products in all stores
products = Product.objects.all()
print(f"\nSeeding inventory for {products.count()} products across {len(created_stores)} stores...")

for store in created_stores:
    for prod in products:
        stock, created = StoreProductStock.objects.get_or_create(
            store=store,
            product=prod,
            defaults={
                "total_quantity": prod.quantity or 5,
                "available_quantity": prod.available_quantity or 5,
            }
        )

print("✅ Stores and StoreProductStock seeding complete!")
