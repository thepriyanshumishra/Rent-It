# RentIt — Clean Data Model Specification

> This document defines the active database schema and data model for RentIt. It documents the core business entities, their fields, relationships, and integrity rules.

---

# 1. Active Core Models Architecture

RentIt operates on a streamlined, 5-app modular architecture:

```text
                           RentIt Core Schema
                                   │
      ┌──────────────┬─────────────┼─────────────┬──────────────┐
      │              │             │             │              │
  accounts        products      rentals       payments    notifications
      │              │             │             │              │
    User          Category       Cart         Payment      Notification
  RenterProfile   Product       CartItem
CustomerProfile  ListingReq   RentalOrder
   Address       ProductImage  RentalItem
```

---

# 2. Detailed Model Schemas

## A. Accounts App (`apps/accounts`)

### 1. `User` (Inherits `AbstractUser`)
- `id`: Auto primary key
- `username`: CharField (unique)
- `email`: EmailField (unique)
- `first_name`, `last_name`: CharField
- `role`: CharField (`ADMIN`, `RENTER`, `CUSTOMER`, `STAFF`)
- `phone_number`: CharField (optional)

### 2. `RenterProfile` (OneToOne -> `User`)
- `user`: OneToOneField -> `User`
- `bank_account_number`: CharField
- `ifsc_code`: CharField
- `upi_id`: CharField
- `wallet_balance`: DecimalField
- `total_earnings`: DecimalField
- `is_verified`: BooleanField

### 3. `CustomerProfile` (OneToOne -> `User`)
- `user`: OneToOneField -> `User`

### 4. `Address` (ForeignKey -> `User`)
- `user`: ForeignKey -> `User`
- `street_address`: CharField
- `city`: CharField
- `state`: CharField
- `postal_code`: CharField
- `country`: CharField
- `is_default`: BooleanField

---

## B. Products App (`apps/products`)

### 1. `Category`
- `name`: CharField (unique)
- `slug`: SlugField (unique)
- `icon`: CharField (Lucide icon key)
- `is_active`: BooleanField
- `created_at`, `updated_at`: DateTimeField

### 2. `Product`
- `name`: CharField
- `slug`: SlugField (unique)
- `category`: ForeignKey -> `Category`
- `renter`: ForeignKey -> `User` (optional)
- `price`: DecimalField (Daily rental rate in ₹)
- `security_deposit`: DecimalField (Refundable deposit in ₹)
- `short_description`: CharField
- `description`: TextField
- `included_items`: TextField
- `condition_tag`: CharField (`Good`, `Superb`, etc.)
- `quantity`: PositiveIntegerField
- `available_quantity`: PositiveIntegerField
- `rating`: DecimalField
- `review_count`: PositiveIntegerField
- `is_featured`, `is_active`: BooleanField
- `created_at`, `updated_at`: DateTimeField

### 3. `RenterListingRequest`
- `renter`: ForeignKey -> `User`
- `product_name`: CharField
- `category`: ForeignKey -> `Category`
- `short_description`: CharField
- `description`: TextField
- `daily_price`: DecimalField
- `security_deposit`: DecimalField
- `quantity`: PositiveIntegerField
- `purchase_bill_url`: URLField
- `image_url`: URLField
- `images_data`: JSONField
- `included_items`: TextField
- `condition_notes`: TextField
- `admin_condition_tag`: CharField
- `admin_custom_condition`: CharField
- `status`: CharField (`PENDING_VERIFICATION`, `INSPECTION_SCHEDULED`, `APPROVED`, `REJECTED`)
- `rejection_reason`: TextField
- `approved_product`: ForeignKey -> `Product`
- `created_at`, `updated_at`: DateTimeField

### 4. `ProductImage`
- `product`: ForeignKey -> `Product`
- `image`: ImageField (optional)
- `image_url`: URLField
- `alt_text`: CharField
- `is_primary`: BooleanField
- `created_at`: DateTimeField

---

## C. Rentals App (`apps/rentals`)

### 1. `Cart` & `CartItem`
- `Cart`: `user` (FK -> `User`), `created_at`
- `CartItem`: `cart` (FK -> `Cart`), `product_id` (IntegerField), `quantity` (PositiveIntegerField)

### 2. `RentalOrder`
- `order_number`: CharField (`RNT-XXXXXX`)
- `user`: ForeignKey -> `User`
- `fulfillment_type`: CharField (`DOORSTEP`, `STORE_PICKUP`)
- `pickup_code`: CharField (6-digit handshake OTP)
- `delivery_address`: TextField
- `delivery_pincode`: CharField
- `total_amount`: DecimalField
- `status`: CharField (`CONFIRMED`, `ACTIVE`, `RETURNED`, `UNDER_INSPECTION`, `COMPLETED`)
- `created_at`: DateTimeField

### 3. `RentalOrderItem`
- `order`: ForeignKey -> `RentalOrder`
- `product_id`: IntegerField
- `quantity`: PositiveIntegerField
- `price`: DecimalField

---

## D. Payments & Notifications (`apps/payments` & `apps/notifications`)

### 1. `Payment`
- `order`: ForeignKey -> `RentalOrder`
- `amount`: DecimalField
- `payment_method`: CharField
- `status`: CharField
- `transaction_id`: CharField
- `created_at`: DateTimeField

### 2. `Notification`
- `user`: ForeignKey -> `User`
- `message`: CharField
- `is_read`: BooleanField
- `created_at`: DateTimeField