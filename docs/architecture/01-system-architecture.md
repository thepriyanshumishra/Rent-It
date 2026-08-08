# RentIt — System Architecture & Component Design

> High-level system architecture specification for RentIt, covering frontend composition, API design, backend DRF services, and database persistence.

---

# 1. High-Level Architecture Overview

RentIt employs a decoupled architecture comprising a Vite + React SPA frontend and a Python / Django REST Framework (DRF) backend API with SQLite persistence:

```text
┌─────────────────────────────────────────────────────────┐
│                 REACT FRONTEND (Vite SPA)               │
│                                                         │
│  [Customer Storefront]   [Single-Page Renter Portal]    │
│  [Centered Top-Pill Admin Operational HQ Bar]           │
└────────────────────────────┬────────────────────────────┘
                             │  REST API (JWT Auth)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 DJANGO REST FRAMEWORK (DRF)             │
│                                                         │
│   apps/accounts   apps/products   apps/rentals          │
│   apps/payments   apps/notifications                    │
└────────────────────────────┬────────────────────────────┘
                             │  ORM Queries
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 SQLITE DATABASE (12 Core Models)        │
└─────────────────────────────────────────────────────────┘
```

---

# 2. Frontend Layout & Navigation Design

1. **Admin HQ Navigation**:
   - **Centered Top Bar Pills**: Horizontal nav pills (`HQ Dashboard`, `Listing Requests`, `Pickups & Orders`, `HQ Inventory`) positioned in the exact horizontal middle (`absolute left-1/2 -translate-x-1/2`).
   - **Sidebar Removal**: Completely eliminates left sidebars for maximum operational visibility.

2. **Lender Portal**:
   - Single-page dashboard displaying equipment listings, stock quantities, and HQ inspection status.
   - Simplified submission form with single invoice upload and multiple gear photos.

3. **Customer Storefront**:
   - **Explore Rentals UI**: Hero section banner, horizontal category pills scrollbar, 4:3 product cards displaying daily rates and refundable security deposit badges.

---

# 3. Backend DRF Architecture

The backend consists of 5 modular Django applications:

1. **`accounts`**: User management, custom roles (`ADMIN`, `LENDER`, `CUSTOMER`), Lender profiles with payout information, Customer shipping addresses, and SimpleJWT authentication endpoints.
2. **`products`**: Equipment categories, active rental product inventory, renter listing request verification pipeline with HQ condition tagging, and product media.
3. **`rentals`**: Shopping cart operations, rental orders, doorstep delivery address capture, 6-digit pickup verification codes, and order status transitions (`CONFIRMED` → `ACTIVE` → `RETURNED` → `COMPLETED`).
4. **`payments`**: Payment callback handling, transaction record logging, and deposit status tracking.
5. **`notifications`**: User alert notifications with read/unread flags.
