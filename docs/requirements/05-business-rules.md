# RentIt — Business Rules

> This document defines the business rules governing RentIt's rental, pricing, payment, deposit, return, inventory, and operational workflows. These rules describe expected business behavior and constraints, not a specific technical implementation.

---

# 1. Purpose

RentIt is a rental-management platform.

Its business logic must ensure that rental operations remain consistent from the moment a customer selects a product until the rental is completely settled.

The system must prevent invalid business states such as:

- Renting unavailable inventory.
- Confirming a rental without required payment.
- Returning a rental twice.
- Applying the same late fee twice.
- Refunding a deposit twice.
- Making damaged inventory available.
- Completing a rental before required settlement.
- Allowing unauthorized users to perform protected operations.

This document provides the authoritative business-rule reference for those behaviors.

---

# 2. Business Rule Philosophy

Business rules should be:

- Explicit.
- Consistent.
- Deterministic.
- Testable.
- Enforced at the appropriate application boundary.
- Independent from presentation.
- Resistant to duplicate requests.
- Resistant to invalid state transitions.

The frontend may communicate rules to the user, but the authoritative enforcement must exist in trusted application logic.

---

# 3. Rule Priority

When rules conflict, use the following priority:

1. Explicit hackathon/problem-statement requirement.
2. Explicit product requirement.
3. This business-rules document.
4. Security and data-integrity requirements.
5. Reasonable engineering interpretation.

If a requirement is genuinely ambiguous and materially affects money, inventory, or irreversible state, the ambiguity should be surfaced rather than silently inventing a critical business rule.

---

# 4. Customer Rules

## BR-001 — Customer Identity

Every customer rental must be associated with an identifiable customer account or authorized customer record.

A rental should not become an orphaned business transaction.

---

## BR-002 — Customer Data Isolation

A customer may access only information they are authorized to access.

At minimum, customers must not access another customer's:

- Profile.
- Addresses.
- Rentals.
- Payments.
- Deposits.
- Invoices.
- Return information.
- Settlement information.

---

## BR-003 — Customer Ownership

Customer-facing rental operations should operate against the authenticated customer's authorized rental records.

A client must not be able to change ownership of a rental simply by modifying a request parameter.

---

# 5. Product Rules

## BR-004 — Product Must Exist

A rental can only reference a valid rental product or product variant.

A deleted or invalid product reference must not create a valid new rental.

---

## BR-005 — Product Rental Eligibility

A product must be eligible for rental before it can be confirmed for a rental transaction.

A product that is:

- Archived.
- Permanently unavailable.
- Under repair.
- Otherwise restricted from rental.

must not be confirmed for a new incompatible rental.

---

## BR-006 — Product Availability Is Time-Aware

Availability must be evaluated against the requested rental period.

A product being available at the current moment does not necessarily mean it is available for every future rental period.

---

## BR-007 — Availability Must Be Authoritative

The availability displayed to a customer is informational until final validation.

The system must perform an authoritative availability check before confirming a rental.

---

# 6. Rental Period Rules

## BR-008 — Valid Rental Period

A rental period must contain a valid start and expected return.

The expected return must logically occur after the rental start.

---

## BR-009 — Rental Duration

The rental duration must comply with the configured rental-period rules.

The system should not silently accept invalid or unsupported durations.

---

## BR-010 — Rental Period Persistence

Once a rental is confirmed, the relevant rental-period information must remain associated with that rental.

Later configuration changes should not silently rewrite historical rental periods.

---

# 7. Rental Availability Rules

## BR-011 — No Conflicting Confirmed Rentals

The same inventory cannot be committed to two incompatible confirmed rental periods.

The system must protect against overlapping commitments.

---

## BR-012 — Availability Revalidation

Availability must be revalidated at important confirmation boundaries.

A previously available product may become unavailable before the customer completes checkout.

The system must handle this situation rather than confirming an invalid rental.

---

## BR-013 — Concurrent Rental Attempts

If multiple users attempt to reserve or confirm the same limited inventory concurrently, the system must ensure that incompatible confirmations do not both succeed.

The technical concurrency mechanism is an implementation decision.

---

## BR-014 — Availability After Return

A returned product should not automatically become available merely because the physical return has been recorded.

The product may require:

- Inspection.
- Cleaning.
- Repair.
- Maintenance.
- Other operational processing.

Availability should reflect its actual operational condition.

---

# 8. Pricing Rules

## BR-015 — Authoritative Pricing

The final rental price must be determined by trusted application logic.

Client-supplied prices must not be treated as authoritative.

---

## BR-016 — Applicable Pricelist

The system should determine the applicable pricelist according to the configured business context.

The selected pricing should be consistent throughout the rental confirmation process.

---

## BR-017 — Historical Price Integrity

Once a rental is confirmed, its finalized financial values should remain historically meaningful.

Changing a product's future pricing should not silently alter previously confirmed rental transactions.

---

## BR-018 — Price Consistency

The price presented during confirmation should correspond to the authoritative price used when the rental is finalized.

If the applicable price changes before confirmation, the system may require recalculation or explicit user confirmation.

---

# 9. Cart Rules

## BR-019 — Cart Is Not a Confirmed Rental

Adding a product to a cart does not automatically guarantee inventory availability.

Inventory may change before confirmation.

---

## BR-020 — Cart Price Revalidation

Important pricing information should be revalidated before final confirmation.

---

## BR-021 — Cart Availability Revalidation

The system should revalidate availability before creating a confirmed rental.

---

# 10. Rental Confirmation Rules

## BR-022 — Confirmation Preconditions

A rental should only be confirmed when all required conditions are satisfied.

Depending on the rental configuration, this may include:

- Valid customer.
- Valid product.
- Valid rental period.
- Product availability.
- Valid pricing.
- Required fulfillment information.
- Required payment.
- Required security deposit.

---

## BR-023 — Confirmation Creates Commitment

Once confirmed, a rental represents a business commitment.

The relevant product availability should reflect that commitment.

---

## BR-024 — Confirmation Must Be Atomic in Effect

A rental should not appear successfully confirmed while critical associated operations have failed in a way that makes the rental invalid.

The technical transaction strategy is an implementation decision.

---

# 11. Payment Rules

## BR-025 — Payment State Must Be Authoritative

Payment status must come from trusted payment/application state.

A frontend declaration that payment succeeded is insufficient.

---

## BR-026 — Failed Payment

A failed payment must not be treated as a successful completed payment.

If payment is required for confirmation, the rental must not become confirmed solely because a failed payment attempt occurred.

---

## BR-027 — Pending Payment

A pending payment should not automatically be interpreted as a completed payment unless the configured business workflow explicitly allows it.

---

## BR-028 — Duplicate Payment Effects

Repeated payment callbacks or equivalent repeated confirmation signals must not create duplicate financial effects.

---

## BR-029 — Payment Association

A payment must remain associated with the correct rental or financial transaction.

Payment information must not be transferable between unrelated rentals through client manipulation.

---

# 12. Security Deposit Rules

## BR-030 — Deposit Requirement

A security deposit is required only when the applicable rental/product/business configuration requires one.

---

## BR-031 — Deposit Calculation

The system should support the configured deposit calculation method.

Supported concepts include:

- Fixed amount.
- Percentage-based amount.

The final calculation must come from authoritative business logic.

---

## BR-032 — Deposit Association

A collected security deposit must remain associated with the relevant rental.

---

## BR-033 — Deposit Is Not Rental Revenue

A security deposit should remain conceptually distinct from the rental charge.

It is held for potential settlement according to the rental outcome.

---

## BR-034 — Deposit Cannot Be Settled Twice

A completed deposit settlement must not be executed again as though it were unsettled.

---

## BR-035 — Deposit Settlement Requires Relevant Information

The final deposit settlement should occur after the information required for settlement is available.

This may include:

- Return.
- Inspection.
- Late-fee evaluation.
- Damage evaluation.
- Missing-item evaluation.

The exact sequence may vary by business workflow.

---

## BR-036 — Full Deposit Refund

If no authorized deductions apply, the eligible deposit amount should be refunded according to the supported financial workflow.

---

## BR-037 — Partial Deposit Refund

If authorized deductions apply, only the eligible remaining amount should be refunded.

---

## BR-038 — Deposit Deduction Must Be Justified

A deposit deduction should correspond to an authorized business reason.

Possible reasons include:

- Late fee.
- Damage.
- Missing item/accessory.
- Other explicitly supported charge.

---

## BR-039 — Deposit Settlement Integrity

The total financial effect of settlement must remain consistent.

The system should not accidentally refund more than the eligible deposit or deduct more than the authorized amount.

---

# 13. Pickup and Fulfillment Rules

## BR-040 — Confirmed Rental Required

Pickup or delivery should normally operate against a valid confirmed rental.

---

## BR-041 — Correct Rental Association

A pickup or delivery confirmation must be associated with the correct rental and relevant product/customer.

---

## BR-042 — Pickup Should Not Create Duplicate Handover

Repeated pickup confirmation should not create multiple independent handover events that alter rental state incorrectly.

---

## BR-043 — Handover and Active Rental

The rental should enter its appropriate active operational state only after the required fulfillment/handover conditions have been satisfied.

---

# 14. Active Rental Rules

## BR-044 — Active Rental Controls Availability

While a product is actively rented, it should not be considered freely available for incompatible rentals.

---

## BR-045 — Expected Return

An active rental must retain its expected return time.

---

## BR-046 — Active Rental Visibility

Active rentals should be visible to appropriate administrators for operational monitoring.

Customers should be able to see relevant information about their own active rentals.

---

# 15. Return Rules

## BR-047 — Return Must Reference an Existing Rental

A return must be associated with a valid rental.

---

## BR-048 — Return Should Not Be Confirmed Twice

A rental that has already had its return confirmed must not be processed as a completely new return without an appropriate correction/reversal workflow.

---

## BR-049 — Actual Return Time

The system should retain the actual return time because it affects:

- Late duration.
- Late fees.
- Settlement.
- Operational history.

---

## BR-050 — Return Does Not Equal Completion

Recording a physical return does not automatically mean the rental is fully completed.

The rental may still require:

- Inspection.
- Damage evaluation.
- Late-fee calculation.
- Settlement.
- Deposit handling.
- Inventory update.

---

# 16. Overdue Rules

## BR-051 — Overdue Detection

A rental becomes overdue when the expected return time has passed without a valid return.

---

## BR-052 — Grace Period

Where a grace period is configured, the system should apply it according to the configured business rule before charging the applicable late fee.

---

## BR-053 — Overdue Status

An overdue rental should remain identifiable as overdue until the relevant return or resolution occurs.

---

## BR-054 — Overdue Visibility

Overdue rentals should be visible to administrators.

Customers should receive appropriate visibility into their overdue status.

---

# 17. Late-Fee Rules

## BR-055 — Configurable Charging Interval

The system should support configurable late-fee intervals including:

- Hourly.
- Daily.
- Weekly.
- Monthly.

---

## BR-056 — Late-Fee Basis

Late fees should be calculated from the applicable overdue duration and configured charging rule.

---

## BR-057 — Grace Period Exclusion

Time covered by an applicable grace period should not be charged as late time unless the configured business rule explicitly specifies otherwise.

---

## BR-058 — Maximum Late Fee

If a maximum late-fee limit is configured, the final applicable late fee must not exceed that limit.

---

## BR-059 — Late Fee Cannot Be Negative

A calculated late fee must never result in a negative charge.

---

## BR-060 — On-Time Return

If a rental is returned within the valid return period and applicable grace period, no late fee should be generated.

---

## BR-061 — Late-Fee Recalculation

Before final settlement, the system should ensure that the late fee reflects the authoritative return time and configured rules.

---

## BR-062 — Duplicate Late-Fee Prevention

The same overdue period must not result in duplicate late-fee charges because of repeated jobs, callbacks, or administrative actions.

---

# 18. Inspection Rules

## BR-063 — Returned Product Inspection

A returned product should be eligible for inspection where inspection is required by the rental workflow.

---

## BR-064 — Inspection Result

An inspection should be able to determine whether the product:

- Is acceptable.
- Has damage.
- Has missing items.
- Requires repair.
- Requires another operational action.

---

## BR-065 — Inspection Affects Inventory

Inspection results may affect product availability.

---

## BR-066 — Inspection Affects Settlement

Where configured, inspection findings may affect financial settlement.

---

# 19. Damage Rules

## BR-067 — Damage Must Be Recorded

Damage identified during inspection should be recorded through the supported operational workflow.

---

## BR-068 — Damage Does Not Automatically Mean a Fixed Charge

The existence of damage does not by itself define the amount to be deducted.

The applicable charge must follow the configured business rules.

---

## BR-069 — Damage Can Restrict Availability

A damaged product should not be made available for normal rental if its condition prevents safe or appropriate use.

---

# 20. Missing Item Rules

## BR-070 — Missing Components

Missing accessories or components may be recorded during inspection.

---

## BR-071 — Missing Item Charges

If the business configuration supports charging for missing items, the applicable charge may contribute to settlement.

---

## BR-072 — Inventory Effect

A product missing required components may remain unavailable until the issue is resolved.

---

# 21. Inventory Rules

## BR-073 — Inventory Must Reflect Operational State

Inventory availability must correspond to the actual rental and operational condition of the product.

---

## BR-074 — Reserved / Committed Inventory

Inventory committed to a confirmed incompatible rental must not be treated as freely available.

---

## BR-075 — Returned Inventory

Returned inventory should pass through the appropriate post-return workflow before being made available again.

---

## BR-076 — Damaged Inventory

Damaged inventory should be restricted from incompatible rental availability.

---

## BR-077 — Repair Inventory

Products under repair should remain unavailable for ordinary rental.

---

## BR-078 — Re-Availability

A product should become available again only when the required operational conditions have been satisfied.

---

# 22. Repair Rules

## BR-079 — Repair Trigger

A repair workflow may be initiated when inspection or another authorized operational process determines that repair is required.

---

## BR-080 — Repair Restricts Availability

A product under repair must not be treated as normally available for rental.

---

## BR-081 — Repair Completion

Completing a repair does not necessarily mean the product is immediately rentable if another validation step is required.

---

## BR-082 — Return to Available State

A repaired product may become available only after the required operational checks are complete.

---

# 23. Rental Completion Rules

## BR-083 — Completion Preconditions

A rental should only be considered fully completed after the required operational and financial processes are complete.

Depending on the workflow, this may include:

- Return.
- Inspection.
- Late-fee evaluation.
- Damage evaluation.
- Missing-item evaluation.
- Deposit settlement.
- Financial finalization.
- Inventory update.

---

## BR-084 — Completed Rental Stability

A completed rental should represent a stable historical business record.

Ordinary operations should not silently reopen or rewrite a completed rental.

If corrections are necessary, they should use an appropriate authorized correction workflow.

---

# 24. Cancellation Rules

## BR-085 — Cancellation Before Confirmation

A customer may abandon or cancel an intended rental before confirmation according to the supported workflow.

---

## BR-086 — Cancellation After Confirmation

A confirmed rental may only be cancelled when the business workflow permits cancellation at that stage.

---

## BR-087 — Cancellation After Handover

A rental that has already been handed over should generally not be treated as a simple cancellation.

It may require a return or separate resolution workflow.

---

## BR-088 — Cancellation and Financial State

Cancellation must not leave inconsistent payment or deposit records.

Where money has already been collected, the appropriate refund or financial-resolution workflow must be followed.

---

# 25. Payment and Rental State Relationship

## BR-089 — No False Confirmation

If payment is mandatory for confirmation, a rental must not become confirmed solely because checkout was submitted.

---

## BR-090 — Payment State Changes

Changes in payment state should affect rental state only according to explicit business logic.

---

## BR-091 — Payment Reversal

If a payment is reversed or refunded, the system should not silently assume that the rental remains financially unchanged.

The appropriate business workflow must determine the consequence.

---

# 26. Quotation Rules

## BR-092 — Quotation Is Not a Rental

A quotation should not automatically be treated as a confirmed rental.

---

## BR-093 — Quotation Confirmation

Only a valid quotation should be confirmed.

---

## BR-094 — Quotation to Rental

A confirmed quotation may progress into the rental workflow according to the supported business process.

---

## BR-095 — Historical Quotation Integrity

Once a quotation has progressed into a committed transaction, its historical relationship to the resulting rental should remain traceable.

---

# 27. Offline Rental Rules

## BR-096 — Admin-Created Rental

An administrator may create a rental on behalf of a customer.

The same fundamental rental business rules should apply.

---

## BR-097 — Offline and Online Consistency

Online and offline rentals should use consistent concepts for:

- Product.
- Pricing.
- Rental period.
- Deposit.
- Payment.
- Return.
- Inspection.
- Settlement.

The entry point may differ, but the underlying business behavior should remain coherent.

---

# 28. Invoice Rules

## BR-098 — Invoice Association

An invoice should remain associated with the correct rental or financial transaction.

---

## BR-099 — Invoice Historical Integrity

Invoices associated with completed financial transactions should remain historically stable.

---

## BR-100 — Late-Fee Invoice

Where late-fee invoicing is enabled, the invoice should correspond to the authoritative late-fee amount.

---

# 29. Administrative Configuration Rules

## BR-101 — Configuration Applies Prospectively

Changes to configuration should not silently rewrite historical rental outcomes unless an explicit correction workflow exists.

Examples include:

- Pricing.
- Deposit configuration.
- Late-fee rules.
- Rental periods.

---

## BR-102 — Configuration Validation

Administrators should not be able to create configurations that are logically invalid.

Examples include:

- Negative deposit values.
- Negative late fees.
- Invalid rental durations.
- Invalid charging intervals.

The exact validation set may evolve with the final configuration model.

---

# 30. Dashboard Rules

## BR-103 — Dashboard Uses Authoritative Data

Dashboard metrics should derive from authoritative business records.

---

## BR-104 — Dashboard Consistency

The same underlying business state should produce consistent values across:

- Dashboard.
- Rental lists.
- Rental details.
- Customer portal.

---

## BR-105 — Operational Metrics

Metrics such as:

- Active rentals.
- Overdue rentals.
- Rentals due today.
- Deposits held.
- Late fees collected.

should be calculated according to consistent business definitions.

---

# 31. Notification Rules

## BR-106 — Notifications Must Reflect Real Events

Notifications should be triggered by actual business events rather than frontend assumptions.

---

## BR-107 — Duplicate Notification Protection

Repeated processing of the same business event should not unnecessarily generate duplicate notifications where duplication would be undesirable.

---

## BR-108 — Notification Failure

Failure to send a notification should not silently corrupt the underlying rental state.

Notification delivery and business state should be appropriately decoupled.

---

# 32. Security Rules

## BR-109 — Authorization Is Mandatory

Every protected operation must verify that the acting user is authorized.

---

## BR-110 — Client Cannot Override Permissions

Client-supplied role information, IDs, prices, statuses, or similar values must not override server-side authorization or business rules.

---

## BR-111 — Resource Ownership

Resource-level authorization should be applied where appropriate.

A customer should not gain access to another customer's rental simply by changing a resource identifier.

---

# 33. Auditability Rules

## BR-112 — Important Operations Should Be Traceable

Important operational and financial actions should have sufficient history to understand:

- What happened.
- When it happened.
- Which record was affected.
- Which user or process initiated it.

---

## BR-113 — Financial Actions

Important financial actions such as:

- Deposit settlement.
- Refund.
- Deduction.
- Late-fee adjustment.

should be appropriately traceable.

---

# 34. Idempotency and Duplicate-Action Rules

## BR-114 — Repeated Requests

Repeated requests must not cause duplicate business effects where the operation is logically single-use.

Examples include:

- Confirming a rental.
- Confirming pickup.
- Confirming return.
- Settling a deposit.
- Processing a refund.
- Applying a late fee.

---

## BR-115 — Safe Retry

Where operations may reasonably be retried because of network or infrastructure failures, the system should distinguish a retry from a new business operation.

---

# 35. Concurrency Rules

## BR-116 — Concurrent Inventory Access

Concurrent operations involving the same limited inventory must preserve inventory correctness.

---

## BR-117 — Concurrent Rental Confirmation

Two incompatible rental confirmations must not both succeed against the same unavailable inventory.

---

## BR-118 — Concurrent Return Processing

Two staff members should not be able to independently finalize the same return in a way that produces contradictory financial or inventory outcomes.

---

# 36. Data Integrity Rules

## BR-119 — Referential Integrity

Important business records should remain associated with valid related records.

Examples:

- Rental → Customer.
- Rental → Product.
- Payment → Rental.
- Deposit → Rental.
- Return → Rental.
- Inspection → Return/Rental.
- Settlement → Rental.

---

## BR-120 — No Orphaned Financial State

Important financial records should not exist without a meaningful business relationship.

---

## BR-121 — Historical Preservation

Completed rental activity should remain available for historical analysis and reporting.

---

# 37. Exceptional Case Rules

## BR-122 — Product Becomes Unavailable

If a product becomes unavailable before confirmation, the system should not confirm an incompatible rental.

---

## BR-123 — Payment Succeeds but Confirmation Fails

If payment succeeds but the rental cannot be confirmed, the system must avoid leaving the customer in an unexplained financial state.

An appropriate recovery or reconciliation workflow should exist.

The exact implementation depends on the payment architecture.

---

## BR-124 — Return Without Expected Rental State

If a return is received for a rental in an unexpected state, the system should not blindly complete the normal workflow.

The event should be handled according to an appropriate exception/recovery process.

---

## BR-125 — Settlement Failure

If settlement cannot be completed, the system should preserve enough state to retry or resolve the settlement without duplicating previous successful operations.

---

# 38. Business Rule vs Implementation

This document defines **business outcomes and constraints**.

It intentionally does not prescribe:

- Database transactions.
- SQL constraints.
- State-machine libraries.
- Background workers.
- Queues.
- Redis.
- API endpoints.
- Frontend validation libraries.
- Backend framework.
- Payment-provider architecture.
- Exact data structures.

The engineering implementation should satisfy these rules using an appropriate architecture.

---

# 39. Rule Precedence and Ambiguity

When a business rule is unclear:

1. Check the official problem statement.
2. Check the product requirements.
3. Check the rental lifecycle.
4. Check related requirements.
5. Determine whether the ambiguity affects money, inventory, security, or irreversible state.
6. If it materially affects one of those areas, surface the ambiguity.
7. Otherwise, make a reasonable and documented engineering assumption.

Do not invent complex business rules merely to eliminate every possible ambiguity.

---

# 40. Core Invariants

The following invariants should remain true throughout the system.

### Invariant 1 — Availability

A product committed to an incompatible rental cannot simultaneously be treated as freely available.

### Invariant 2 — Payment

A failed payment cannot be treated as a successful required payment.

### Invariant 3 — Deposit

A security deposit cannot be settled twice.

### Invariant 4 — Return

A completed return cannot be processed again as a new return without an appropriate correction workflow.

### Invariant 5 — Late Fee

The same late period cannot produce duplicate charges.

### Invariant 6 — Inventory

A damaged or under-repair product cannot incorrectly appear as normally available.

### Invariant 7 — Authorization

A user cannot perform an operation they are not authorized to perform.

### Invariant 8 — Historical Integrity

Completed rentals must remain historically meaningful.

### Invariant 9 — Financial Integrity

The final financial outcome must remain internally consistent.

### Invariant 10 — Rental State

A rental must always occupy a logically valid business state.

---

# 41. Recommended Validation Mindset

When implementing a business operation, the agent should ask:

```text
What is the current state?
        ↓
Is this operation allowed from this state?
        ↓
Does the user have permission?
        ↓
Are required records present?
        ↓
Is inventory still valid?
        ↓
Are financial conditions satisfied?
        ↓
Can this operation safely be repeated?
        ↓
What happens if it fails halfway?
        ↓
What new state should result?
        ↓
What related records must change?

This is a reasoning framework, not a mandatory implementation pattern.

42. Business Rule Testing

The highest-value business rules should have meaningful automated tests.

Particularly important areas include:

Availability conflicts.
Rental confirmation.
Payment failure.
Deposit calculation.
Deposit settlement.
Late-fee calculation.
Grace periods.
Maximum late fees.
Return processing.
Damage deductions.
Inventory transitions.
Duplicate operations.
Concurrent operations.
Authorization.

Tests should verify actual business behavior rather than merely checking implementation details.

43. Business Rule Documentation Principle

If an implementation introduces a new significant business rule that changes how RentIt operates, this document or an appropriate related document should be updated.

The documentation should remain useful as a source of truth for future developers and AI agents.

Do not allow important business behavior to exist only inside undocumented code.

44. Final Business Rule Principle

RentIt's business logic should preserve five things above everything else:

Availability must be truthful.

Money must be correct.

Rental state must be valid.

Inventory must reflect reality.

Users must only perform authorized actions.

Everything else should be designed around these principles while keeping the product practical, understandable, and scalable.