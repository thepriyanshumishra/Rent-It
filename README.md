# RentIt — Enterprise Rental Management Platform

> A high-performance, enterprise-grade equipment rental management system inspired by the usability and operational power of Odoo. Built for the Odoo Hackathon.

---

## 🌟 Overview

**RentIt** is a full-stack equipment rental management system designed to handle the complete rental lifecycle—from gear discovery, duration selection, and security deposit checkout to Renter Partner gear submissions, HQ verification, stock management, and order fulfillment.

```text
 🛍️ CUSTOMER              🤝 RENTER PARTNER          👑 ADMIN HQ OPERATIONS
──────────────           ────────────────────       ──────────────────────────
• Explore Equipment      • Single-Page Dashboard    • Top Nav Pill Controls
• Date Range & Cart      • Gear Submission Form     • Condition Tagging & Approval
• Doorstep Delivery      • Live Listing Search      • Dispatch & Pickups
• Deposit Checkout       • 1-Click Removal          • Stock & Inventory Control
```

---

## 🚀 Key Features & Highlights

- **👑 Admin HQ Operational Control**:
  - **Sidebar-Free Design**: Maximum screen width for operational density.
  - **Centered Top Nav Pills**: Quick switcher between `HQ Dashboard`, `Listing Requests`, `Pickups & Orders`, and `HQ Inventory`.
  - **Gear Verification Pipeline**: Review renter-submitted equipment, inspect proof-of-purchase bills, assign condition tags (`Good`, `Superb`, etc.), and set approved inventory quantity.
  - **Order Lifecycle Manager**: Transition orders smoothly through `CONFIRMED` → `ACTIVE` → `RETURNED` → `COMPLETED`.

- **🤝 Renter Partner Single-Page Dashboard**:
  - **All-in-One Dashboard**: Track total earnings, wallet balance, and listing requests on a single page.
  - **Live Search & Remove**: Instant client-side search bar for listed gear with `View Listing` storefront links and 1-click `Delete` removal.

- **🛍️ Customer Storefront & Checkout**:
  - **Curated Gear Discovery**: Hero banner with horizontal category pills scrollbar (Cameras, Audio, Electronics, Lenses).
  - **4:3 Equipment Cards**: Displaying daily rental rates, condition badges, and refundable security deposit pills.
  - **Express Doorstep Delivery**: Express delivery address capture with instant checkout simulation.

- **🔑 1-Click Demo Login System**:
  - Pre-seeded instant authentication buttons for Admin, Renter, and Customer roles on `/login`.

---

## 🛠️ Technology Stack

### Frontend
- **Core**: React 18 (Vite SPA)
- **Styling**: Vanilla CSS Variables (Dark/Light mode system) + Tailwind CSS utilities
- **Icons**: Lucide React
- **State & Data Fetching**: TanStack React Query + React Context API

### Backend
- **Framework**: Python 3.14 + Django 5.x + Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JSON Web Tokens) with custom Role-Based Access Control (`ADMIN`, `RENTER`, `CUSTOMER`)
- **Database**: SQLite (12 Clean Core Models across 5 active applications)

---

## 🏗️ Project Architecture & Directory Structure

```text
RentIt/
├── backend-drf/                  # Python Django DRF API (Port 8000)
│   ├── apps/
│   │   ├── accounts/             # User, RenterProfile, CustomerProfile, Address
│   │   ├── products/             # Category, Product, RenterListingRequest, ProductImage
│   │   ├── rentals/              # Cart, CartItem, RentalOrder, RentalOrderItem
│   │   ├── payments/             # Payment log
│   │   └── notifications/        # User alert notifications
│   ├── rental_project/           # Django settings & URL routing
│   └── manage.py
│
├── frontend-react/               # React Vite SPA Frontend (Port 3000)
│   ├── src/
│   │   ├── components/           # Shared, Admin, Customer, and UI components
│   │   ├── context/              # Auth, Cart, Theme, and Notification contexts
│   │   ├── pages/                # Admin, Renter, Customer, and Auth pages
│   │   └── api/                  # Axios HTTP client with JWT interceptors
│   └── vite.config.js
│
├── docs/                         # Architecture, PRD, and Design System docs
├── SUMMARY.md                    # Executive Summary & Architectural Overview
├── AGENTS.md                     # Engineering Guidelines
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

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies & run migrations
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt python-decouple Pillow
python manage.py migrate

# Seed fresh demo accounts
python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')
django.setup()
from django.contrib.auth import get_user_model
from apps.accounts.models import RenterProfile, CustomerProfile
User = get_user_model()
u1, _ = User.objects.get_or_create(username='admin', defaults={'email':'admin@rentit.com','role':'ADMIN','is_staff':True,'is_superuser':True})
u1.set_password('Password@123'); u1.save()
u2, _ = User.objects.get_or_create(username='renter', defaults={'email':'renter@rentit.com','role':'RENTER'})
u2.set_password('Password@123'); u2.save()
RenterProfile.objects.get_or_create(user=u2, defaults={'is_verified':True})
u3, _ = User.objects.get_or_create(username='customer', defaults={'email':'customer@rentit.com','role':'CUSTOMER'})
u3.set_password('Password@123'); u3.save()
CustomerProfile.objects.get_or_create(user=u3)
print('Demo accounts ready!')
"

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

You can test all 3 portals instantly using the **1-Click Demo Login** buttons on the `/login` screen:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Admin (HQ)** | `admin@rentit.com` | `Password@123` | `/admin/dashboard` |
| **Renter Partner** | `renter@rentit.com` | `Password@123` | `/renter/dashboard` |
| **Customer** | `customer@rentit.com` | `Password@123` | Storefront / Explore |

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](file:///Users/thedarkpcm/Desktop/Priyanshu/All%20Projects/RentIt/LICENSE) for details.