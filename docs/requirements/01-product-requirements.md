# RentIt — Product Requirements Document (PRD)

> This document specifies the functional scope, user requirements, and operational features for RentIt.

---

# 1. Product Vision & Goals

RentIt is built to streamline the complete equipment rental experience for Customers, Renters, and Admin HQ Operators:

1. **Seamless Discovery & Rental**: Customers explore verified gear, select rental dates, place doorstep delivery orders, and pay refundable security deposits.
2. **Effortless Renter Gear Listing**: Renter Partners list camera equipment, audio gear, and electronics with proof-of-purchase bills and images.
3. **Streamlined Admin HQ Operations**: HQ Operators inspect submitted gear, assign condition tags, approve listings, manage stock, and oversee order dispatches.

---

# 2. Scope & Key Features

### A. Customer Portal
- Explore page with hero banner and horizontal category pills scrollbar.
- Product detail view with daily rental price, security deposit badge, and included accessories.
- Cart & Checkout with doorstep delivery address selection.
- 1-Click Demo Login (`customer@rentit.com`).

### B. Renter Partner Portal
- Single-page consolidated dashboard.
- Live equipment search bar for searching listed gear.
- "View Listing" storefront link & instant "Delete" listing action.
- "List New Equipment" form with bill upload & images.
- Payout details (Bank account number, IFSC code, UPI ID) and earnings overview.

### C. Admin HQ Operations
- Centered top navigation pills (`HQ Dashboard`, `Listing Requests`, `Pickups & Orders`, `HQ Inventory`).
- Gear Verification Pipeline: Inspect incoming renter submissions, assign condition tags (`Good`, `Superb`, etc.), and set approved quantity.
- Order Lifecycle Manager: Transition orders through `CONFIRMED`, `ACTIVE`, `RETURNED`, and `COMPLETED`.
- Stock Inventory Management: View overall equipment availability with top-right `+ New Product` shortcut.