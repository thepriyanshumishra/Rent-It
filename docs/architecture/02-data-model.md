# RentIt — Data Model

> This document defines the conceptual data model for RentIt. It establishes the major business entities, their responsibilities, relationships, ownership boundaries, lifecycle associations, and important data-integrity principles. It does not prescribe a specific database engine, ORM, SQL schema, or implementation language.

---

# 1. Purpose

RentIt is fundamentally a data-driven rental-management system.

Its core business state is represented through relationships between:

```text
Customer
   ↓
Rental
   ↓
Product
   ↓
Inventory
   ↓
Payment
   ↓
Security Deposit
   ↓
Return
   ↓
Inspection
   ↓
Settlement

The data model must preserve these relationships accurately throughout the rental lifecycle.

2. Data Modeling Philosophy

The data model should prioritize:

Business correctness.
Referential integrity.
Financial integrity.
Inventory integrity.
Historical integrity.
Query efficiency.
Extensibility.
Maintainability.
Clear ownership.
Appropriate normalization.

The model should avoid unnecessary duplication while also avoiding excessive normalization that makes ordinary business operations unnecessarily complex.

3. Core Domain Entities

The primary conceptual entities are:

User
Customer
Role
Permission

Product
ProductVariant
ProductCategory
ProductAttribute

InventoryItem
Availability

Rental
RentalItem
RentalPeriod

Pricelist
PriceRule

Cart
CartItem

Payment
SecurityDeposit
Charge
Refund

Fulfillment
Pickup
Delivery

Return
Inspection
Damage
MissingItem

Settlement

Repair

Quotation
QuotationItem

Invoice

Notification
AuditEvent

Not every entity must necessarily become a separate physical database table.

The final implementation should determine the appropriate representation.

4. Identity and Access Domain

The identity domain represents people and access control.

Conceptually:

User
 ├── Role
 │    └── Permission
 │
 └── Customer Profile

Administrative users may have different roles and permissions from customers.

5. User

The User entity represents an authenticated identity within RentIt.

Potential conceptual information includes:

Unique identity.
Name.
Contact information.
Authentication-related metadata.
Account status.
Role association.
Creation information.
Last activity information where useful.

Authentication secrets should not be stored inappropriately.

The exact authentication model is an implementation decision.

6. Customer

A Customer represents the business customer who rents products.

A customer may have:

Profile information.
Contact information.
Addresses.
Rentals.
Payments.
Deposits.
Invoices.
Rental history.

Conceptually:

Customer
   │
   ├── Addresses
   ├── Rentals
   ├── Payments
   ├── Deposits
   └── Invoices
7. Role

A Role represents a logical access category.

Examples may include:

Customer.
Rental Staff.
Inventory Staff.
Finance Staff.
Administrator.

The final role structure should be determined according to the actual product requirements.

8. Permission

A Permission represents an allowed capability.

Examples:

View products.
Create rental.
Manage inventory.
Process return.
Perform settlement.
Manage configuration.

Permissions should not be treated as UI-only concepts.

Authorization must ultimately be enforced by trusted application logic.

9. Product Domain

The product domain represents what the rental business offers.

Conceptually:

Product
 ├── Category
 ├── Attributes
 ├── Variants
 └── Inventory
10. Product

A Product represents a rentable product definition.

Potential information includes:

Name.
Description.
Images.
Category.
Brand.
Manufacturer.
Rental eligibility.
Product-level configuration.
Attributes.

A product definition is not necessarily the same thing as a physical inventory item.

11. Product Variant

A ProductVariant represents a specific variation of a product.

Examples may include:

Camera
 ├── Black
 ├── Silver

or:

Projector
 ├── Standard
 ├── 4K

A variant may have its own:

Attributes.
Availability.
Pricing.
Inventory.

The final implementation should determine whether variants are necessary for a particular product.

12. Product Category

A ProductCategory groups related products.

Examples:

Electronics.
Cameras.
Furniture.
Vehicles.
Equipment.

Categories should support efficient browsing and management.

13. Product Attribute

A ProductAttribute represents a characteristic used to describe or differentiate products.

Examples:

Color.
Size.
Brand.
Capacity.
Model.

The attribute system should remain extensible.

14. Inventory Domain

The inventory domain represents the operational availability of products.

Conceptually:

Product
   ↓
Inventory Item
   ↓
Rental Commitment
   ↓
Availability
15. Inventory Item

An InventoryItem represents a specific rentable unit where the business needs to track physical units independently.

For example:

Product:
Canon Camera

Inventory:
Camera #001
Camera #002
Camera #003

This distinction becomes important when individual physical units have:

Different conditions.
Different repair histories.
Different availability.
Different rental histories.

Not every product necessarily needs individually tracked inventory.

The implementation should support the appropriate level of inventory tracking.

16. Inventory State

An inventory item may conceptually have states such as:

Available
Reserved
Rented
Returned
Under Inspection
Under Repair
Unavailable
Retired

The exact state representation is an implementation decision.

17. Availability

Availability represents whether a product or inventory unit can be committed to a requested rental period.

Availability is derived from multiple factors.

Conceptually:

Availability
=
Inventory State
+
Rental Commitments
+
Rental Period
+
Operational Restrictions

Availability should not necessarily be stored as an independently editable fact if it can be safely derived from authoritative records.

18. Rental Domain

The rental domain is the central business domain.

Conceptually:

Customer
   ↓
Rental
   ├── Rental Items
   ├── Rental Period
   ├── Pricing
   ├── Payment
   ├── Deposit
   ├── Fulfillment
   ├── Return
   └── Settlement
19. Rental

A Rental represents the central business transaction.

A rental should be associated with:

Customer.
Rental items.
Rental period.
Pricing information.
Payment information.
Deposit information.
Fulfillment information.
Lifecycle state.
Return information.
Settlement information.

A rental should have a stable unique identity.

20. Rental Item

A RentalItem represents an individual product or product variant included in a rental.

A rental may contain multiple rental items.

Conceptually:

Rental
 ├── RentalItem
 ├── RentalItem
 └── RentalItem

A rental item may contain information such as:

Product.
Variant.
Quantity.
Applicable price.
Deposit contribution.
Inventory association where required.
21. Rental Period

A RentalPeriod represents the intended rental duration.

It should conceptually contain:

Start.
Expected return.
Duration or derivable duration.

The rental period is important for:

Availability.
Pricing.
Due-date calculation.
Late-fee calculation.
22. Rental State

The rental should have a coherent lifecycle state.

Possible conceptual states include:

Draft
Pending Confirmation
Confirmed
Scheduled
Active
Due
Overdue
Returned
Under Inspection
Pending Settlement
Completed
Cancelled

Additional states may be appropriate.

The final state model should follow the rental-lifecycle and business-rules documents.

23. Rental History

Important lifecycle transitions should remain historically traceable.

Possible history information includes:

Previous state.
New state.
Timestamp.
Actor.
Relevant event.

The exact audit/event implementation is an architectural decision.

24. Cart Domain

The cart represents a customer's intended rental before confirmation.

Conceptually:

Cart
 ├── Customer
 └── Cart Items
       ├── Product
       ├── Rental Period
       └── Quantity

A cart should not be treated as a confirmed rental.

25. Cart Item

A CartItem represents an intended rental item.

It may contain:

Product.
Variant.
Quantity.
Rental period.
Pricing snapshot or relevant reference.

Cart information may change before confirmation.

26. Pricing Domain

The pricing domain determines the financial amount associated with renting a product.

Conceptually:

Pricelist
   ↓
Price Rule
   ↓
Product / Variant
   ↓
Rental Period
   ↓
Rental Price
27. Pricelist

A Pricelist represents a collection of pricing rules.

Multiple pricelists may exist.

Examples could include:

Default.
Premium Customer.
Seasonal.
Corporate.

The final pricing configuration should follow actual business requirements.

28. Price Rule

A PriceRule represents the logic or configuration used to determine an applicable price.

Relevant inputs may include:

Product.
Variant.
Rental duration.
Customer/pricelist context.
Applicable time period.

The exact pricing engine is an implementation decision.

29. Financial Domain

The financial domain represents monetary operations associated with rentals.

Conceptually:

Rental
 ├── Payment
 ├── Security Deposit
 ├── Charges
 ├── Refunds
 └── Settlement

These records should remain logically associated.

30. Payment

A Payment represents money paid toward a rental or related financial transaction.

Potential information includes:

Rental.
Customer.
Amount.
Currency.
Status.
Payment method.
External reference where applicable.
Timestamp.

Payment records should remain historically meaningful.

31. Security Deposit

A SecurityDeposit represents the amount held against potential rental-related obligations.

A deposit should be associated with the relevant rental.

Conceptually:

Rental
   ↓
Security Deposit
   ├── Amount
   ├── Status
   ├── Deductions
   └── Refund
32. Charge

A Charge represents an additional financial obligation associated with a rental.

Possible examples:

Late fee.
Damage charge.
Missing-item charge.
Other authorized charge.

Charges should identify their reason and financial amount.

33. Refund

A Refund represents money returned to the customer.

A refund may relate to:

Rental payment.
Security deposit.
Other authorized financial transaction.

Refunds should remain associated with the relevant source transaction.

34. Settlement

A Settlement represents the final financial resolution of a rental.

Conceptually:

Rental
   ↓
Settlement
   ├── Charges
   ├── Deposit Deductions
   ├── Refund
   └── Final Financial Outcome

A rental should not be considered financially complete merely because a return was recorded.

35. Fulfillment Domain

Fulfillment represents how the product reaches the customer.

Conceptually:

Rental
   ↓
Fulfillment
   ├── Pickup
   └── Delivery
36. Fulfillment

A Fulfillment record represents the operational method associated with the rental.

Potential information includes:

Rental.
Fulfillment type.
Scheduled time.
Status.
Location/address.
Completion information.
37. Pickup

A Pickup represents a store pickup or handover operation.

It may contain:

Rental.
Customer.
Location.
Scheduled time.
Actual time.
Confirmation information.
38. Delivery

A Delivery represents a delivery operation.

It may contain:

Rental.
Delivery address.
Scheduled time.
Delivery status.
Completion information.

Advanced route information may be added later if required.

39. Return Domain

The return domain represents the physical return of rented products.

Conceptually:

Rental
   ↓
Return
   ↓
Inspection
   ↓
Settlement
   ↓
Inventory
40. Return

A Return represents the actual return event.

Potential information includes:

Rental.
Returned items.
Actual return time.
Return location.
Return status.
Notes.
Actor.

The actual return time is critical for late-fee calculations.

41. Inspection

An Inspection represents evaluation of returned products.

It may contain:

Rental.
Return.
Product/inventory item.
Condition.
Damage findings.
Missing-item findings.
Inspection result.
Notes.
Evidence.
42. Damage

A Damage represents damage identified during inspection.

Potential information includes:

Product/inventory item.
Inspection.
Description.
Severity.
Evidence.
Charge information where applicable.

Damage records may influence:

Settlement.
Inventory.
Repair.
43. Missing Item

A MissingItem represents an accessory, component, or other expected item that was not returned.

It may influence:

Settlement.
Inventory.
Replacement/repair workflow.
44. Repair Domain

The repair domain represents maintenance required after inspection or another operational event.

Conceptually:

Inventory Item
      ↓
Repair
      ↓
Repair Completed
      ↓
Validation
      ↓
Available
45. Repair

A Repair represents a maintenance or repair workflow.

Potential information includes:

Inventory item.
Reason.
Status.
Start time.
Completion time.
Notes.
Cost where applicable.
46. Quotation Domain

The quotation domain supports rentals initiated through an administrative sales workflow.

Conceptually:

Quotation
   ↓
Quotation Items
   ↓
Confirmation
   ↓
Rental
47. Quotation

A Quotation represents a proposed rental transaction before commitment.

It may contain:

Customer.
Rental items.
Rental period.
Pricing.
Deposit.
Validity.
Status.

A quotation should remain distinct from a confirmed rental.

48. Quotation Item

A QuotationItem represents a product included in a quotation.

It should preserve the relevant proposed rental information.

49. Invoice Domain

An Invoice represents a formal financial document associated with a rental or related financial operation.

An invoice may be associated with:

Rental.
Customer.
Charges.
Payment status.

The exact accounting model may evolve.

50. Notification Domain

A Notification represents a communication generated from a relevant business event.

Examples:

Rental confirmation.
Return reminder.
Overdue notification.
Settlement notification.

Notifications should not become the source of truth for business state.

51. Audit Domain

An AuditEvent represents a traceable important action or state change.

Potential information includes:

Actor.
Action.
Entity.
Entity identifier.
Timestamp.
Relevant metadata.

Audit records should avoid storing unnecessary sensitive information.

52. Entity Relationship Overview

A simplified conceptual relationship model is:

User
 │
 ├──────────── Role
 │                │
 │                └──── Permission
 │
 └──── Customer
          │
          ├──── Address
          │
          ├──── Rental
          │       │
          │       ├──── RentalItem ─── Product
          │       │                     │
          │       │                     ├── Category
          │       │                     ├── Attributes
          │       │                     └── Variant
          │       │
          │       ├──── RentalPeriod
          │       ├──── Payment
          │       ├──── SecurityDeposit
          │       ├──── Fulfillment
          │       ├──── Return
          │       │       └──── Inspection
          │       │               ├──── Damage
          │       │               └──── MissingItem
          │       │
          │       └──── Settlement
          │
          └──── Invoice

Inventory connects the product/rental side:

Product
   ↓
InventoryItem
   ↓
Availability / Rental Commitments
53. Core Entity Relationship Rules

The following relationships are fundamental.

Customer → Rental

One customer may have many rentals.

A rental should belong to one customer unless the business model explicitly supports another arrangement.

Rental → RentalItem

A rental may contain one or more rental items.

RentalItem → Product

Each rental item references a product or variant.

Rental → RentalPeriod

A rental has an associated rental period.

Rental → Payment

A rental may have one or more payment records depending on the financial workflow.

Rental → SecurityDeposit

A rental may have a security deposit where configured.

Rental → Return

A rental may have a return record representing its physical return workflow.

The model should prevent contradictory duplicate return states.

Return → Inspection

A return may require one or more inspection records depending on the workflow.

Inspection → Damage

An inspection may identify zero or more damage findings.

Inspection → MissingItem

An inspection may identify zero or more missing items.

Rental → Settlement

A rental may have a settlement record representing its final financial outcome.

InventoryItem → Rental

A physical inventory item may participate in multiple rentals over its lifetime, but should not be committed to incompatible overlapping rentals.

54. Product vs Inventory Distinction

One of the most important data-model distinctions is:

Product ≠ Physical Inventory Item

For example:

Product
"Canon EOS Camera"

Inventory Items
├── Camera #001
├── Camera #002
└── Camera #003

This distinction allows RentIt to support:

Individual condition.
Individual repair history.
Individual availability.
Individual rental history.

However, not every business requires unit-level tracking.

The model should support the distinction without forcing unnecessary complexity for products that do not require it.

55. Rental vs Cart Distinction

Another important distinction:

Cart ≠ Rental

A cart represents:

"The customer intends to rent this."

A rental represents:

"The business has accepted this rental according to the required confirmation rules."

56. Rental vs Quotation Distinction

Similarly:

Quotation ≠ Confirmed Rental

A quotation represents a proposal.

A confirmed rental represents a committed business transaction.

57. Payment vs Deposit Distinction

The model must distinguish:

Rental Payment

from:

Security Deposit

The two may both involve money, but they have different business meanings.

58. Return vs Settlement Distinction

The model must also distinguish:

Return

from:

Settlement

A returned product may still require:

Inspection.
Damage evaluation.
Late-fee calculation.
Deposit deduction.
Refund.

Therefore:

Return ≠ Settlement
59. Inventory vs Availability Distinction

Inventory represents the physical/operational asset.

Availability represents whether it can be committed for a requested rental context.

Therefore:

Inventory State
+
Rental Commitments
+
Requested Period
=
Availability Decision
60. Snapshot vs Reference Data

The data model should distinguish between information that should remain historically stable and information that can be looked up dynamically.

For example:

A confirmed rental may need to retain historical financial information even if:

Product name changes.
Product description changes.
Pricelist changes.
Deposit configuration changes.

The implementation should preserve historical correctness.

61. Financial Snapshot Principle

Where historical financial values matter, the system should preserve the values applicable to the finalized transaction rather than relying exclusively on current configuration.

Examples include:

Final rental price.
Applied deposit amount.
Final late fee.
Final charges.
Settlement amount.
62. Product History Principle

Changes to product configuration should not silently rewrite historical rental information.

For example:

If a product's name changes after a rental is completed, historical records should remain understandable.

63. Configuration History Principle

Configuration changes should not silently change the meaning of already completed transactions.

This is particularly important for:

Pricing.
Deposit rules.
Late-fee rules.
Rental-period configuration.
64. State Ownership

Each important state should have a clear owner.

Examples:

Rental State
    → Rental Domain

Payment State
    → Financial / Payment Domain

Inventory State
    → Inventory Domain

Repair State
    → Repair Domain

Other modules may derive information from these states but should not independently maintain contradictory copies.

65. Derived Data

Some information can be derived rather than stored independently.

Examples:

Dashboard counts.
"Overdue" indicators.
Availability views.
Revenue summaries.

Derived data may be cached or materialized if necessary for performance.

However, the authoritative source should remain clear.

66. Data Ownership

Each domain should have clear responsibility for its data.

Conceptually:

Customers
   → Customer Domain

Products
   → Product Domain

Rentals
   → Rental Domain

Payments / Deposits
   → Financial Domain

Inventory
   → Inventory Domain

Repairs
   → Repair Domain

The final physical schema may combine some concepts where appropriate.

67. Referential Integrity

Important relationships should remain valid.

Examples:

Rental → valid Customer
RentalItem → valid Product
Payment → valid Rental
Deposit → valid Rental
Return → valid Rental
Inspection → valid Return
Settlement → valid Rental
Repair → valid Inventory Item

The database/application should enforce integrity at appropriate levels.

68. Deletion Strategy

Business records should generally not be physically deleted merely because they are no longer active.

For example:

Completed rentals.
Payments.
Settlements.
Invoices.
Historical inspections.

should retain appropriate history.

Archiving or soft-deactivation may be more appropriate depending on the entity.

69. Product Deletion

A product with historical rental relationships should generally not be physically removed in a way that destroys historical integrity.

Instead, it should become inactive/archived where appropriate.

70. Customer Deletion

Customer deletion must consider historical business records.

A customer with completed rentals, payments, invoices, or settlements should not be deleted in a way that destroys required business history.

The final privacy/deletion policy should be determined separately if required.

71. Audit Data

Audit records should preserve meaningful history without becoming an uncontrolled duplicate copy of the entire database.

Audit data should focus on important actions and state transitions.

72. Time Data

Important entities may require timestamps such as:

Created at.
Updated at.
Start time.
Expected return time.
Actual return time.
Payment time.
Settlement time.
Repair start/completion.

The exact timestamp fields should be determined during implementation.

73. Money Data

Monetary values should have:

Appropriate precision.
Currency context where relevant.
Clear meaning.

Financial calculations should not depend on inappropriate floating-point behavior.

74. Status Data

Status fields should represent meaningful business states rather than arbitrary UI labels.

For example:

Rental Status

should represent the actual rental lifecycle.

A UI badge such as:

"Almost Due"

may be derived from underlying state and timestamps rather than becoming a new authoritative business state.

75. Data Validation

Important entities should enforce appropriate validation.

Examples:

Rental
Valid customer.
Valid rental period.
Valid items.
Payment
Valid amount.
Valid rental.
Valid status.
Deposit
Valid amount.
Valid rental.
Valid settlement state.
Inventory
Valid product.
Valid operational state.

The exact validation rules belong to the business-rules document and implementation.

76. Concurrency and Data Model

The data model should support safe handling of concurrent operations.

Particularly important relationships include:

Inventory ↔ Rental
Payment ↔ Rental
Deposit ↔ Settlement
Return ↔ Rental
Settlement ↔ Rental

The final implementation should use appropriate database/application mechanisms to protect these relationships.

77. Idempotency Data

Where important operations can be retried, the system may require appropriate identifiers or records that allow it to recognize repeated operations.

Potential examples:

Payment reference.
External transaction reference.
Settlement operation identifier.
Return operation identifier.

The exact mechanism is implementation-dependent.

78. External References

When external providers are used, their identifiers should be stored separately from RentIt's internal identifiers.

Conceptually:

RentIt Payment ID
        +
External Provider Payment ID

This prevents external systems from becoming the identity source for the internal business model.

79. Internal vs External Identity

Every important RentIt entity should have an internal identity.

External identifiers should be treated as integration metadata rather than replacements for internal identity.

80. Data Model and API Design

API representations do not have to match database representations exactly.

For example:

Database
    ↓
Domain Model
    ↓
API Response Model

The API should expose what clients need rather than leaking the entire persistence model.

81. Data Model and Frontend

The frontend should consume appropriate representations of domain data.

It should not need to understand internal database relationships that are irrelevant to the user experience.

82. Data Model and Reporting

Reporting may require aggregated or specialized representations.

For example:

Rental Records
      ↓
Aggregation
      ↓
Revenue Report

The reporting layer should remain derived from authoritative business data.

83. Data Model and Search

Search indexes or optimized search representations may duplicate selected information.

If such representations are introduced, they should be treated as derived data.

The primary business database remains authoritative.

84. Data Model and Caching

Cached representations should be treated as temporary/derived.

A cache failure should not destroy the authoritative business state.

85. Data Model Evolution

The data model should evolve through controlled migrations.

Changes should consider:

Existing data.
Historical records.
Backward compatibility.
Application version compatibility.
Data migration requirements.
86. Data Model Anti-Patterns

Avoid:

Anti-pattern 1 — One Giant Rental Table

Do not put every possible business concept into one enormous entity.

Anti-pattern 2 — Everything Is JSON

Do not hide core relational business data inside arbitrary JSON simply to avoid modeling relationships.

Anti-pattern 3 — Duplicate Source of Truth

Do not maintain multiple independently editable versions of critical business state.

Anti-pattern 4 — Historical Mutation

Do not silently rewrite completed financial transactions when current configuration changes.

Anti-pattern 5 — Product = Inventory

Do not assume a product definition and a physical unit are always the same concept.

Anti-pattern 6 — Return = Completion

Do not collapse return, inspection, settlement, and inventory into one event when the business process requires them to remain distinct.

87. Recommended Conceptual Core

At the center of the data model should be:

Customer
   │
   ▼
Rental
   │
   ├──────────────► Rental Items ─────► Product
   │
   ├──────────────► Rental Period
   │
   ├──────────────► Payment
   │
   ├──────────────► Security Deposit
   │
   ├──────────────► Fulfillment
   │
   ├──────────────► Return
   │                         │
   │                         ▼
   │                     Inspection
   │                         │
   │                  ┌──────┴──────┐
   │                  ▼             ▼
   │               Damage      Missing Item
   │
   └──────────────► Settlement
                         │
                         ▼
                    Refund / Charges

Inventory operates alongside this:

Product
   │
   ▼
Inventory Item
   │
   ├── Availability
   ├── Rental History
   └── Repair History
88. Minimum Viable Data Model

For the hackathon, the minimum viable model should strongly support:

User
Customer

Product
Product Variant
Product Category

Rental
Rental Item
Rental Period

Payment
Security Deposit

Inventory

Return
Inspection

Charge
Settlement

Quotation
Invoice

Additional entities should be introduced when they provide meaningful value.

89. Data Model Evolution Beyond MVP

Future capabilities may introduce additional models for:

Advanced asset tracking.
Maintenance schedules.
Delivery routing.
Notifications.
Analytics.
Customer segmentation.
Subscription rentals.
Multi-location inventory.
Advanced pricing.
External integrations.

These should extend the model rather than destabilize the core rental relationships.

90. Multi-Location Readiness

Although multiple physical locations may not be required for the initial implementation, the data model should avoid making multi-location operation impossible.

Potential future concepts include:

Location
   ↓
Inventory
   ↓
Pickup / Delivery

This should not be implemented prematurely unless required.

91. Multi-Currency Readiness

The system should avoid assumptions that make future currency support unnecessarily difficult.

However, multi-currency support does not need to become a core feature unless required.

92. Multi-Tenant Consideration

If RentIt eventually becomes a SaaS platform serving multiple rental businesses, tenant isolation would become a major architectural concern.

Conceptually:

Tenant
 ├── Users
 ├── Customers
 ├── Products
 ├── Inventory
 └── Rentals

Multi-tenancy is not required unless the product scope explicitly demands it.

The current architecture should simply avoid making future evolution impossible.

93. Data Model Documentation Principle

Whenever a significant new entity or relationship is introduced, the documentation should be updated.

The goal is for an AI agent or developer to understand:

What is this entity?
Why does it exist?
What owns it?
What does it reference?
What references it?
What business rules govern it?
94. Source-of-Truth Principle

The most important rule of the data model is:

Every critical business fact should have one authoritative source.

For example:

Rental State
→ Rental

Payment State
→ Payment

Deposit State
→ Security Deposit

Inventory State
→ Inventory

Repair State
→ Repair

Other representations should derive from these authoritative records.

95. Final Data Model Principle

The RentIt data model should preserve the distinction between:

What the business offers

→ Product

What physically exists

→ Inventory Item

What the customer intends to rent

→ Cart / Quotation

What the business has committed to

→ Rental

What money was paid

→ Payment

What money was held

→ Security Deposit

What happened when the product came back

→ Return / Inspection

What money was finally resolved

→ Settlement

What happened to the physical product afterward

→ Inventory / Repair

These distinctions form the foundation of a reliable rental-management system.