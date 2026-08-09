# RentIt — Enterprise Rental Management Platform

> A high-performance, enterprise-grade equipment rental & physical store management system inspired by the operational power of Odoo. Built for the Odoo Hackathon.

---

## 🌟 Overview

**RentIt** is a full-stack multi-store equipment rental management system designed to handle the complete rental lifecycle—from gear discovery, nearest store location lookup via pincode/geolocation, slot booking, and deposit escrow checkout to Store Vendor counter verification, 4-digit pickup code verification (`PKP-XXXX`), inventory tracking, and inspection returns processing.

```text
 🛍️ CUSTOMER STOREFRONT             🏬 STORE VENDOR COUNTER PORTAL         ⚙️ DJANGO ADMIN HQ
──────────────────────────────       ──────────────────────────────────     ──────────────────────────
• Nearby Hub Discovery (Haversine)   • Centered Pill-Shaped Navigation      • Superuser Model Control
• Slot Selection (Morning/Eve)       • Instant 4-Digit Pickup Verification  • System-Wide Oversight
• Escrow Deposit Checkout            • Store Inventory & Stock Control      • Full Audit Logs & Data
• Real-time Notification Alerts      • Return Inspection & Late Fees        • Django Security Rules
```

---

## 🚀 Key Features & Highlights

- **🏬 Store Vendor Counter Portal**:
  - **Centered Pill-Shaped Navigation**: Clean horizontal toggle bar (`Dashboard`, `My Listings`, `Orders & Verification`).
  - **Instant Pickup Code Handover**: Verify customer 4-digit pickup codes (`PKP-XXXX` / `RNT-XXXXXX`) at the counter to confirm identity and release equipment.
  - **Counter Return Inspection**: Inspect returned equipment condition (`Good`, `Damaged`, `Missing Accessories`), calculate automated late fees, and restore store inventory in real-time.
  - **Store Banner & GST Info**: Displays company name, GSTIN, and assigned store hub location details.

- **🛍️ Customer Storefront & Multi-Hub Booking**:
  - **Pincode & Distance Auto-Selection**: Nearest store detection using Haversine coordinate distance math.
  - **Rental Slot Booking**: Select preferred pickup slots (*Morning 10 AM–1 PM*, *Afternoon 2 PM–6 PM*, *Evening 6 PM–9 PM*).
  - **Cart & Escrow Deposit**: Transparent item breakdown with daily rates, deposit calculation, and instant checkout confirmation.
  - **My Rentals & Live Verification Code**: View active rentals, order status (`RESERVED`, `PICKED_UP`, `RETURNED`, `CANCELLED`), and pickup verification codes.

- **🔔 In-App Notification Engine**:
  - Automated notification triggers for booking confirmation, pickup readiness, equipment handover, and return completion with deep-link order references.

- **🔑 1-Click Instant Demo Login**:
  - Pre-configured demo login buttons for **Store Vendor Staff** (`abc@defg.com`) and **Customer** on `/login`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite SPA)
- **Styling**: Modern CSS System (Design tokens, glassmorphism, responsive pills) + Tailwind CSS utilities
- **Icons**: Lucide React
- **State & Data Fetching**: TanStack React Query + React Context API (`AuthContext`, `StoreContext`, `CartContext`, `NotificationContext`)
- **HTTP Client**: Axios with automated SimpleJWT Bearer token interceptors and auto-refresh

### Backend
- **Framework**: Python 3.14 + Django 5.x + Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JSON Web Tokens) with custom Role-Based Access Control (`STAFF`, `CUSTOMER`, `ADMIN`)
- **Database**: SQLite with optimized schema (Clean relations across `accounts`, `products`, `stores`, `rentals`, `notifications`, `reports`)

---

## 🏗️ Project Architecture & Directory Structure

```text
RentIt/
├── backend-drf/                  # Django REST Framework API (Port 8000)
│   ├── apps/
│   │   ├── accounts/             # User, VendorProfile, Address
│   │   ├── products/             # Category, Product, ProductImage
│   │   ├── stores/               # Store, StoreProductStock (Haversine math)
│   │   ├── rentals/              # Cart, CartItem, RentalOrder, RentalOrderItem, LateFeeConfig
│   │   ├── notifications/        # Notification alert engine
│   │   └── reports/              # Analytics & Dashboard stats
│   ├── rental_project/           # Django settings & URL routing
│   └── manage.py
├── frontend-react/               # React 18 Vite SPA (Port 3000)
│   ├── src/
│   │   ├── components/           # Shared, Vendor, Customer, Store, and UI design system
│   │   ├── context/              # Auth, Store, Cart, Theme, and Notification contexts
│   │   ├── pages/                # Vendor, Customer, and Auth pages
│   │   └── api/                  # Axios HTTP client with JWT interceptors
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+

### 2. Backend Setup (Django DRF)
```bash
cd backend-drf

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies & run migrations
pip install -r requirements.txt  # or: pip install django djangorestframework django-cors-headers djangorestframework-simplejwt Pillow
python manage.py migrate

# Seed multi-region stores & catalog data
python seed_stores.py
python seed_catalog.py

# Start backend server (Runs at http://localhost:8000)
python manage.py runserver 8000
```

### 3. Frontend Setup (React Vite)
```bash
cd frontend-react

# Install dependencies
npm install

# Start development server (Runs at http://localhost:3000)
npm run dev
```

---

## 🔑 Demo Login Credentials

You can test all portals instantly using the **1-Click Demo Login** buttons on the `/login` screen:

| Role | Email / Username | Password | Target Dashboard |
| :--- | :--- | :--- | :--- |
| **Store Vendor** | `abc@defg.com` / `abc1` | `Abc@12345` | `/vendor/dashboard` |
| **Customer** | `customer@rentit.com` | `Password123!` | Storefront / Explore |
| **Django Superadmin** | `djangoadmin` | `Password123!` | `/admin` (Django HQ Admin) |

---

## 📜 License

This project is licensed under the MIT License.