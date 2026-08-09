import os
import json
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()

from django.utils.text import slugify
from apps.accounts.models import User, VendorProfile
from apps.stores.models import Store, StoreProductStock
from apps.products.models import Category, Product, ProductImage

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

def seed_dataset(filepath):
    print(f"\n--- Ingesting dataset from: {os.path.basename(filepath)} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        store_code = item.get("store_code")
        store_name = item.get("store_name")
        vendor_company = item.get("vendor_company_name", "")
        vendor_email = item.get("vendor_email")
        vendor_phone = item.get("vendor_phone", "")
        gst_number = item.get("gst_number", "")
        address = item.get("address", "")
        city = item.get("city", "Kolkata")
        state = item.get("state", "West Bengal")
        pincode = str(item.get("pincode", ""))
        latitude = item.get("latitude")
        longitude = item.get("longitude")
        opening_time = item.get("opening_time", "09:00 AM")
        closing_time = item.get("closing_time", "09:00 PM")
        operating_days = item.get("operating_days", "Monday – Saturday")

        # 1. Create or get Vendor User & VendorProfile
        if not vendor_email:
            vendor_email = f"vendor_{slugify(store_code)}@rentit.com"
        
        username_base = vendor_email.split('@')[0].replace('.', '_').replace('-', '_')
        user = User.objects.filter(email=vendor_email).first()
        if not user:
            # Ensure unique username
            username = username_base
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}_{count}"
                count += 1
            
            user = User.objects.create(
                username=username,
                email=vendor_email,
                role=User.Role.STAFF,
                phone_number=vendor_phone,
                is_staff=True
            )
            user.set_password('Password123!')
            user.save()
            print(f"Created Vendor User: {user.username} ({user.email})")

        # Update or create VendorProfile
        VendorProfile.objects.update_or_create(
            user=user,
            defaults={
                'company_name': vendor_company,
                'gst_number': gst_number
            }
        )

        # 2. Create or update Store
        store, created = Store.objects.update_or_create(
            code=store_code,
            defaults={
                'name': store_name,
                'description': f"{vendor_company} - {address}",
                'address': address,
                'city': city,
                'state': state,
                'pincode': pincode,
                'latitude': latitude,
                'longitude': longitude,
                'phone': vendor_phone,
                'email': vendor_email,
                'opening_time': opening_time,
                'closing_time': closing_time,
                'operating_days': operating_days,
                'manager': user,
                'is_active': True
            }
        )
        action = "Created" if created else "Updated"
        print(f"{action} Store: {store.name} ({store.code}) in {city}")

        # 3. Process products for this store
        products = item.get("products", [])
        for prod_data in products:
            cat_name = prod_data.get("category", "General Equipment")
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'icon': 'Package'}
            )

            product_name = prod_data.get("product_name")
            price = prod_data.get("price_per_day", 0.0)
            security_deposit = prod_data.get("security_deposit", 0.0)
            short_desc = prod_data.get("short_description", "")
            detailed_desc = prod_data.get("detailed_description", "")
            included_items = prod_data.get("included_items", "")
            min_rental_days = prod_data.get("min_rental_days", 1)
            total_qty = prod_data.get("total_quantity", 5)
            avail_qty = prod_data.get("available_quantity", 5)
            rating = prod_data.get("rating", 4.5)
            review_count = prod_data.get("review_count", 10)

            # Get or create product
            product, p_created = Product.objects.get_or_create(
                name=product_name,
                category=category,
                defaults={
                    'owner': user,
                    'price': price,
                    'security_deposit': security_deposit,
                    'short_description': short_desc,
                    'description': detailed_desc,
                    'included_items': included_items,
                    'min_rental_days': min_rental_days,
                    'quantity': total_qty,
                    'available_quantity': avail_qty,
                    'rating': rating,
                    'review_count': review_count,
                    'is_active': True
                }
            )

            # If product existed, update available details
            if not p_created:
                product.price = price
                product.security_deposit = security_deposit
                product.short_description = short_desc
                product.description = detailed_desc
                product.included_items = included_items
                product.save()

            # Image attachment
            primary_img = prod_data.get("primary_image_url")
            alt_text = prod_data.get("alt_text", product_name)
            if primary_img:
                ProductImage.objects.get_or_create(
                    product=product,
                    image_url=primary_img,
                    defaults={'alt_text': alt_text, 'is_primary': True, 'sort_order': 0}
                )

            # Link Product Stock to Store
            StoreProductStock.objects.update_or_create(
                store=store,
                product=product,
                defaults={
                    'total_quantity': total_qty,
                    'available_quantity': avail_qty
                }
            )

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Data directory not found at {DATA_DIR}")
        return

    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json')]
    print(f"Found {len(json_files)} dataset files: {json_files}")

    for filename in json_files:
        filepath = os.path.join(DATA_DIR, filename)
        try:
            seed_dataset(filepath)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print("\n==========================================")
    print("ALL DATASETS INGESTED SUCCESSFULLY!")
    print(f"Total Users: {User.objects.count()}")
    print(f"Total Stores: {Store.objects.count()}")
    print(f"Total Categories: {Category.objects.count()}")
    print(f"Total Products: {Product.objects.count()}")
    print(f"Total Stock Mappings: {StoreProductStock.objects.count()}")
    print("==========================================")

if __name__ == '__main__':
    main()
