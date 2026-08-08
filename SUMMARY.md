# RentIt — Project Architecture & Executive Summary

> **RentIt** is an Enterprise-Grade Rental Management Platform built for the Odoo Hackathon. The platform supports the complete rental lifecycle, uniting Customer Discovery, Renter Equipment Submissions & Management, and Admin Operations into a unified, high-performance experience.

---

## 1. System Overview & Core User Roles

RentIt connects three distinct user roles into a cohesive rental ecosystem:

```text
                                  RentIt Platform
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
 🛍️ CUSTOMER PORTAL             🤝 LENDER PORTAL               👑 ADMIN HQ PANEL
   - Equipment Discovery          - Single-Page Dashboard         - Top Navigation Pills
   - Rental Period Selection      - Equipment Submission Form     - HQ Operational Dashboard
   - Doorstep Delivery            - Live Search & Filtering       - Equipment Listing Approvals
   - Security Deposit Checkout    - Instant Listing Removal       - Active Pickups & Orders
   - Active Rental Order Tracking - Payout & Wallet Balance       - HQ Inventory Management
```

### Roles & Responsibilities

1. **Customer**: Browses curated rental gear, selects rental duration, places orders with doorstep delivery, pays security deposits, and manages active/completed rentals.
2. **Lender Partner**: Submits gear for rental listing with proof of purchase and images, tracks verification status, monitors earnings, and manages active listings.
3. **Admin (HQ Operations)**: Operates the platform via a centered top-pill navigation bar without sidebars. Manages gear verification & condition tagging, order dispatch & pickups, and stock availability.

---

## 2. Updated Clean Architecture & Data Model

The backend model architecture has been cleaned to eliminate redundant, dead, and unused models. The entire platform runs on **5 core apps**:

```text
backend-drf/apps/
├── accounts/          # User, LenderProfile, CustomerProfile, Address
├── products/          # Category, Product, LenderListingRequest, ProductImage
├── rentals/           # Cart, CartItem, RentalOrder, RentalOrderItem
├── payments/          # Payment
└── notifications/     # Notification
```

### Active Essential Models (12 Core Models)

| App | Model | Purpose |
| :--- | :--- | :--- |
| **accounts** | `User` | Custom user model with `ADMIN`, `LENDER`, `CUSTOMER` roles & JWT auth |
| **accounts** | `LenderProfile` | Payout details (`bank_account_number`, `ifsc_code`, `upi_id`), `wallet_balance`, `total_earnings` |
| **accounts** | `CustomerProfile` | Profile link for customers |
| **accounts** | `Address` | Shipping addresses for doorstep delivery |
| **products** | `Category` | Equipment categories (`name`, `slug`, `icon`, `is_active`) |
| **products** | `Product` | Active rental gear details, daily price, security deposit, condition tag |
| **products** | `LenderListingRequest` | Gear submission workflow for HQ inspection & verification |
| **products** | `ProductImage` | Product image gallery |
| **rentals** | `Cart` | Customer shopping cart container |
| **rentals** | `CartItem` | Items inside cart with quantity |
| **rentals** | `RentalOrder` | Master order record (`order_number`, `total_amount`, `status`, `pickup_code`) |
| **rentals** | `RentalOrderItem` | Line items inside a rental order |
| **payments** | `Payment` | Transaction log (`amount`, `payment_method`, `status`, `transaction_id`) |
| **notifications** | `Notification` | System notifications for users (`message`, `is_read`) |

> **Removed Dead Apps & Models**: All obsolete modules including `quotations`, `pickups`, `inventory`, `invoices`, `deposits`, `latefees`, `pricing`, `Merchant`, `BusinessOrder`, `ProductVariant`, and `ProductPricing` have been completely removed.

---

## 3. UI/UX Architecture & Layout Enhancements

### 👑 Admin HQ Control Center
- **Sidebar-Free Design**: Removed sidebars to optimize screen width.
- **Centered Navigation Pills**: A top bar containing 4 primary operational pills:
  1. `HQ Dashboard` — Key metrics (Active Rentals, Revenue, Listing Requests, Stock).
  2. `Listing Requests` — Review, condition-tag, approve, or reject renter gear submissions.
  3. `Pickups & Orders` — Order lifecycle management (`CONFIRMED` → `ACTIVE` → `RETURNED` → `COMPLETED`).
  4. `HQ Inventory` — Global stock view with a top-right `+ New Product` action button.

### 🤝 Renter Portal Single-Page Dashboard
- **All-in-One Interface**: Eliminates multi-page tab hopping.
- **Live Search & Filter Bar**: Instant client-side search across all listed equipment.
- **Action Buttons**:
  - `View Listing` — Direct link to the live product storefront page.
  - `Delete` — Instant one-click listing deletion.
  - `List New Equipment` — Clean modal/page form with bill upload & image URLs.

### 🛍️ Customer Storefront & Explore Page
- **Hero Banner**: Visual showcase with quick category chips scrollbar.
- **4:3 Equipment Cards**: Modern cards displaying daily rental rate, condition tag, security deposit pill, and instant "Rent Now" action.
- **Clean Checkout**: Simplified doorstep delivery checkout with instant payment simulation.

---

## 4. Demo Login Credentials (1-Click Login)

For instant testing, 1-click auto-filling login buttons are configured on the `/login` page:

* **Admin Account**: `admin@rentit.com` / `Password@123`
* **Lender Account**: `lender@rentit.com` / `Password123!`
* **Customer Account**: `customer@rentit.com` / `Password@123`
