# RentIt — Rental Lifecycle

> This document defines the complete product-level lifecycle of a rental in RentIt, from product discovery through rental completion, settlement, inventory recovery, and possible repair. It defines expected business flow and state transitions without prescribing a specific technical implementation.

---

# 1. Purpose

The rental lifecycle is the central workflow of RentIt.

A rental should not be treated as a single transaction or a simple CRUD record.

It is a sequence of connected operational stages involving:

- Customer
- Product
- Rental period
- Pricing
- Availability
- Cart
- Payment
- Security deposit
- Pickup/delivery
- Active rental
- Return
- Inspection
- Late fees
- Settlement
- Inventory
- Repair

The lifecycle must remain coherent from beginning to end.

---

# 2. Lifecycle Overview

The conceptual lifecycle is:

```text
Product Discovery
       ↓
Rental Period Selection
       ↓
Availability Validation
       ↓
Cart
       ↓
Fulfillment Selection
       ↓
Payment + Security Deposit
       ↓
Rental Confirmation
       ↓
Pickup / Delivery
       ↓
Active Rental
       ↓
Return Due
       ↓
Return
       ↓
Inspection
       ↓
Late Fee Evaluation
       ↓
Deposit Settlement
       ↓
Inventory Evaluation
       ↓
Repair if Required
       ↓
Available Again

Not every rental will necessarily require every operational step in exactly the same way.

For example:

A rental may be picked up from a store instead of delivered.
A product may not require repair after return.
A deposit may be fully refunded.
A late fee may not apply.

The lifecycle should therefore support different valid paths while preserving the core business rules.

3. Lifecycle Principles

The rental lifecycle should follow these principles:

Every rental should have a clear operational state.
Important state changes should be intentional.
Invalid state transitions should be prevented.
Financial state should remain consistent with rental state.
Product availability should remain consistent with rental state.
Return should not automatically imply complete settlement.
Inspection should be able to affect settlement and inventory.
Damaged products should not become available prematurely.
Late returns should be detectable and handled consistently.
The lifecycle should support both online and offline rental creation.
Important transitions should be traceable.
The workflow should remain understandable to both customers and administrators.
4. Rental Entry Points

A rental may originate through multiple channels.

4.1 Online Customer Rental

A customer may initiate the rental through the customer portal.

Typical flow:

Customer
   ↓
Browse Product
   ↓
Select Rental Period
   ↓
Cart
   ↓
Fulfillment Selection
   ↓
Payment
   ↓
Security Deposit
   ↓
Rental Confirmation
4.2 Admin / In-Store Rental

An administrator may create the rental on behalf of a customer.

Typical flow:

Customer Arrives
      ↓
Admin Creates Quotation
      ↓
Quotation Confirmation
      ↓
Invoice
      ↓
Payment
      ↓
Security Deposit
      ↓
Rental Confirmation

Both entry points should eventually converge into the same underlying rental lifecycle.

RentIt should avoid maintaining two unrelated rental models simply because the rental originated from different channels.

5. Stage 1 — Product Discovery

The lifecycle begins when a customer or administrator identifies a product they want to rent.

The user should be able to understand relevant information such as:

Product identity.
Product description.
Product attributes.
Product variants.
Applicable rental pricing.
Availability information.

At this stage, no rental should be considered confirmed merely because a product was viewed.

6. Stage 2 — Rental Period Selection

The renter selects the desired rental period.

The selected period should determine the relevant:

Start time/date.
Expected return time/date.
Rental duration.
Applicable pricing.
Availability window.

The system should validate that the requested rental period is meaningful and compatible with the product.

7. Stage 3 — Availability Validation

Before confirming a rental, the system should determine whether the requested product is available for the requested rental period.

Availability may depend on:

Existing rentals.
Reservations.
Product condition.
Product repair status.
Operational availability.
Rental-period overlap.

A product that is unavailable for the requested period should not be confirmed for an incompatible rental.

Availability validation should be authoritative rather than relying solely on information previously displayed in the frontend.

8. Stage 4 — Cart

The selected rental item is added to the customer's cart or equivalent pre-confirmation structure.

The cart should preserve the information necessary to understand the intended rental.

Relevant information may include:

Product.
Variant.
Rental period.
Quantity where applicable.
Rental price.
Deposit.
Fulfillment option.
Applicable charges.

The cart represents an intention to rent, not necessarily a finalized rental.

9. Stage 5 — Fulfillment Selection

The renter selects the applicable fulfillment method.

Possible options include:

Delivery.
Store pickup.

For delivery, the system should collect the information required for fulfillment.

For store pickup, the system should capture the relevant pickup information.

The fulfillment choice should remain associated with the rental.

10. Stage 6 — Pricing Evaluation

Before final confirmation, the system should determine the applicable rental price.

Pricing may depend on:

Product.
Product variant.
Rental period.
Applicable pricelist.
Other configured pricing rules.

The final amount presented to the customer should be consistent with the authoritative pricing logic.

Pricing should not be treated as a static frontend value.

11. Stage 7 — Security Deposit Evaluation

Before confirmation, the system should determine whether a security deposit is required.

Where applicable, the deposit may be:

Fixed value.
Percentage-based.

The applicable deposit amount should be associated with the rental.

The customer should be able to understand the deposit requirement before completing the rental.

12. Stage 8 — Payment

The customer or administrator completes the required payment process.

The rental may involve multiple financial concepts:

Rental charge.
Security deposit.
Additional charges.
Applicable taxes or fees where supported.
Later penalties or adjustments.

Payment completion should be reflected in the rental's financial state.

A rental should not be considered fully confirmed merely because a frontend payment form was submitted.

The authoritative payment state must come from trusted application logic.

13. Stage 9 — Rental Confirmation

Once the required conditions are satisfied, the rental becomes confirmed.

Relevant conditions may include:

Valid rental period.
Product availability.
Valid pricing.
Required payment.
Required security deposit.
Valid customer information.
Valid fulfillment information.

A confirmed rental represents a committed rental transaction.

14. Reservation and Availability After Confirmation

Once a rental is confirmed, the relevant product availability should reflect that commitment.

The system should prevent another incompatible rental from being confirmed against the same unavailable inventory.

The exact reservation strategy is an architectural decision.

The product requirement is that confirmed rentals must be respected by availability logic.

15. Stage 10 — Pickup or Delivery

After confirmation, the rental enters the fulfillment phase.

Depending on the selected method:

Store Pickup

The customer collects the product from the relevant location.

Delivery

The product is delivered to the customer.

The operational system should allow staff to understand:

What needs to be delivered or picked up.
For whom.
When.
Where.
Which rental it belongs to.
Whether the operation has been completed.
16. Pickup Operations

For store pickup or operational handover, the system may support:

Pickup scheduling.
Pickup confirmation.
Customer verification.
QR/barcode identification.
Pickup checklist.
Handover confirmation.

The exact operational features may evolve.

The important requirement is that the handover should be connected to the correct rental.

17. Delivery Operations

Where delivery is selected, the system should support the information required to fulfill the delivery.

This may include:

Customer.
Address.
Rental.
Product.
Delivery schedule.
Delivery status.

Potential future capabilities may include route optimization.

Such capabilities should not be required for the core rental lifecycle.

18. Stage 11 — Active Rental

Once the product has been handed over or delivered according to the business workflow, the rental enters its active-use period.

During this period:

The product is considered rented.
The product should not be shown as freely available for incompatible rentals.
The rental should have an expected return time.
The customer should be able to view relevant rental information.
The admin should be able to monitor the rental.

The active rental continues until the product is returned or the rental is otherwise resolved according to the business rules.

19. Active Rental Information

During an active rental, relevant information may include:

Customer.
Product.
Rental start.
Expected return.
Current status.
Payment status.
Deposit status.
Fulfillment information.
Return instructions.
Potential late-fee exposure.

The customer-facing view and admin-facing view may present different levels of detail.

20. Stage 12 — Return Due

Every confirmed rental should have an expected return point based on its rental period.

As the return time approaches, the system should be able to identify the rental as:

Upcoming return.
Due today.
Due soon.

The exact time windows used for these operational categories should be configurable or determined by product/business requirements where necessary.

21. Return Reminders

The system may provide reminders before a rental becomes overdue.

Potential reminder events include:

Upcoming return.
Return due today.
Return deadline approaching.

The notification mechanism is an implementation decision.

The product requirement is that the system should support timely operational awareness.

22. Stage 13 — Overdue Rental

If the expected return time passes without a valid return, the rental becomes overdue.

The system should be able to detect overdue status automatically.

An overdue rental should be visible to the admin through the operational interface.

The customer should also receive appropriate visibility into the overdue condition.

23. Overdue Rental Behavior

When a rental becomes overdue, the system should:

Identify the rental as overdue.
Preserve the original expected return information.
Calculate applicable late duration.
Apply configured late-fee rules where appropriate.
Make the outstanding situation visible.
Continue tracking the rental until return.

The exact fee calculation belongs to the business-rules document.

24. Late-Fee Evaluation

Late fees should be evaluated based on the configured business rules.

Relevant inputs may include:

Expected return time.
Actual return time.
Grace period.
Charging interval.
Maximum fee.
Applicable rental configuration.

Possible charging intervals include:

Hourly.
Daily.
Weekly.
Monthly.

The exact formula is intentionally not defined in this lifecycle document.

25. Stage 14 — Return Initiation

A return begins when the customer or authorized staff initiates the return process.

Depending on the operational workflow, the system may record:

Return initiation.
Return time.
Return location.
Returning customer.
Rental reference.
Product reference.

The return should remain associated with the original rental.

26. Stage 15 — Return Confirmation

Once the product has physically been received, the return should be confirmed according to the operational workflow.

Return confirmation should establish that the product has been handed back.

However:

Return confirmation does not necessarily mean that the rental is fully settled.

Inspection and financial settlement may still be required.

27. Stage 16 — Product Inspection

After return, the product should be evaluated.

Inspection may consider:

General condition.
Damage.
Missing components.
Missing accessories.
Other business-defined conditions.

The result of the inspection may affect:

Security deposit.
Additional charges.
Product availability.
Repair requirements.
Rental completion.
28. Stage 17 — Damage Detection

If damage is identified during inspection, the system should be able to record it.

Potential information may include:

Damage type.
Damage description.
Severity.
Evidence or notes.
Associated product.
Associated rental.
Potential charge.

The exact inspection data model is an architectural decision.

29. Stage 18 — Missing Accessories or Components

If an expected accessory or component is missing, the system should be able to record the issue.

The missing item may affect:

Settlement.
Deposit deduction.
Product availability.
Repair/replacement workflow.

The exact charging policy belongs to the business-rules documentation.

30. Stage 19 — Final Late-Fee Calculation

The actual return time provides the final information required to determine the late-return duration.

The system should calculate the applicable late fee based on the configured rules.

If the rental was returned on time or within the applicable grace period, no late fee should be applied unless another rule explicitly requires it.

If the rental was late, the applicable fee should be determined consistently.

31. Stage 20 — Settlement Evaluation

After return and inspection, the system should determine the final financial outcome of the rental.

Possible components include:

Original rental amount.
Security deposit.
Late fee.
Damage deduction.
Missing-item deduction.
Other authorized charges.
Refund amount.

The settlement should represent the final financial state of the rental.

32. Stage 21 — Security Deposit Settlement

The security deposit should be settled according to the final outcome.

Possible outcomes:

Full Refund

The customer receives the full eligible deposit back.

Partial Refund

A portion is retained to cover authorized charges.

No Refund

The applicable rules may result in the full deposit being consumed by authorized deductions.

The exact deduction rules belong to the business-rules document.

33. Deposit Settlement Integrity

Deposit settlement must be protected against duplication.

The system should prevent scenarios such as:

Refunding the same deposit twice.
Applying the same deduction twice.
Settling a deposit before the required inspection.
Modifying a completed settlement without authorization.

Important settlement actions should be traceable.

34. Stage 22 — Inventory Evaluation

After return and inspection, the product's inventory state should be evaluated.

Possible outcomes include:

Available

The product is in acceptable condition and can be made available for another rental.

Repair Required

The product requires maintenance or repair.

Unavailable

The product should remain unavailable for another reason.

The exact inventory-state model is an architectural decision.

35. Stage 23 — Repair Workflow

If the product requires repair:

Return
   ↓
Inspection
   ↓
Damage / Maintenance Required
   ↓
Repair
   ↓
Repair Completed
   ↓
Inspection / Validation if Required
   ↓
Available

The product should not become available before the business workflow considers it ready.

36. Stage 24 — Rental Completion

A rental should be considered fully completed only when the necessary operational and financial steps have been completed.

Depending on the rental outcome, completion may require:

Product returned.
Inspection completed.
Late fee evaluated.
Damage/missing-item evaluation completed.
Deposit settled.
Applicable financial records finalized.
Inventory state updated.

The exact completion conditions should be defined by the business rules.

37. Final Rental State

Once completed, the rental should retain its historical information.

The completed rental should remain useful for:

Customer history.
Business reporting.
Financial records.
Operational analytics.
Product utilization analysis.
Dispute resolution.
Auditability.

Completing a rental should not mean deleting or losing the historical record.

38. Lifecycle State Model

The following is a conceptual state model.

The final state names are implementation decisions, but the product should represent equivalent business states.

Draft / Cart
     ↓
Pending Confirmation
     ↓
Confirmed
     ↓
Scheduled
     ↓
Active
     ↓
Due for Return
     ↓
Overdue
     ↓
Returned
     ↓
Under Inspection
     ↓
Pending Settlement
     ↓
Completed

Additional operational states may exist where necessary, including:

Cancelled
Payment Failed
Unavailable
Awaiting Pickup
Awaiting Delivery
Repair Required
Disputed

The final state machine should be designed according to the actual business workflow.

39. State Transition Principles

State transitions should be intentional.

Examples:

Draft → Confirmed

should require the conditions necessary for confirmation.

Confirmed → Active

should reflect the appropriate fulfillment/handover event.

Active → Overdue

should occur when the return deadline passes without a valid return.

Active / Overdue → Returned

should represent actual product receipt.

Returned → Under Inspection

should represent the beginning of product evaluation.

Under Inspection → Pending Settlement

should represent completion of the necessary inspection information.

Pending Settlement → Completed

should represent finalization of required settlement and operational state.

The exact transition mechanism is intentionally left open.

40. Cancellation

The system should support cancellation where the business workflow permits it.

Cancellation may occur before certain lifecycle stages.

However, cancellation should not blindly be allowed after irreversible or operationally significant events.

For example, cancelling a rental after:

Product handover.
Payment settlement.
Return.
Final settlement.

may require a different business process rather than simply changing the rental status to "Cancelled."

The exact cancellation rules belong to the business-rules documentation.

41. Payment Failure

A payment failure should not produce a falsely confirmed rental.

Possible behavior includes:

Cart
  ↓
Payment Attempt
  ↓
Payment Failed
  ↓
Retry / Abandon

The system should distinguish between:

Payment initiated.
Payment successful.
Payment failed.
Payment pending.

The exact payment state model is an architectural decision.

42. Availability Conflict

If availability changes between selection and confirmation, the system should not blindly confirm the rental.

For example:

Customer selects product
        ↓
Product appears available
        ↓
Another valid rental is confirmed
        ↓
Customer attempts confirmation

The final confirmation must perform authoritative availability validation.

The customer should receive an understandable message if the product is no longer available.

43. Duplicate Requests

Important lifecycle operations should tolerate reasonable duplicate requests.

Examples:

Duplicate payment callbacks.
Repeated return confirmation.
Repeated deposit settlement request.
Repeated pickup confirmation.

The system should avoid creating duplicate financial or operational effects.

44. Concurrent Operations

The lifecycle should remain correct when multiple authorized users or processes act on the same rental or product.

Examples:

Two staff members attempting to process the same return.
A customer and administrator accessing the same rental.
Inventory changing while a rental is being confirmed.
Payment confirmation arriving while an admin updates the rental.

The technical concurrency strategy is an architectural decision.

The product requirement is that the resulting business state should remain correct.

45. Customer Visibility Throughout the Lifecycle

Customers should receive an appropriate view of their rental's progress.

Relevant information may include:

Rental Confirmed
      ↓
Pickup / Delivery Scheduled
      ↓
Active Rental
      ↓
Return Due
      ↓
Returned
      ↓
Under Inspection
      ↓
Settlement
      ↓
Completed

The customer does not need to see every internal operational state.

The customer-facing lifecycle should expose useful and understandable information without exposing unnecessary internal complexity.

46. Admin Visibility Throughout the Lifecycle

Administrators should have more detailed operational visibility.

The admin should be able to identify:

Current state.
Upcoming deadlines.
Overdue rentals.
Pickup requirements.
Return requirements.
Inspection status.
Settlement status.
Inventory implications.
Repair requirements.

The admin interface should make operational bottlenecks visible.

47. Dashboard Relationship

The operational dashboard should derive its information from the underlying rental lifecycle.

For example:

Active Rentals

Should represent rentals currently in an active operational state.

Rentals Due Today

Should represent rentals whose expected return falls within the relevant operational period.

Overdue Rentals

Should represent rentals whose expected return has passed without valid return completion.

Upcoming Pickups

Should represent confirmed rentals requiring pickup/handover activity.

Upcoming Returns

Should represent rentals approaching their expected return.

Security Deposits Held

Should represent deposits that remain unsettled.

Late Fees Collected

Should reflect finalized applicable late-fee records.

The dashboard should not maintain a disconnected version of these facts.

48. Offline Rental Lifecycle

An offline rental should follow the same fundamental lifecycle.

Example:

Customer Arrives
      ↓
Quotation
      ↓
Quotation Confirmed
      ↓
Invoice
      ↓
Payment + Deposit
      ↓
Rental Confirmed
      ↓
Handover
      ↓
Active Rental
      ↓
Return
      ↓
Inspection
      ↓
Settlement
      ↓
Inventory Update

The point of entry is different, but the underlying rental concepts should remain consistent.

49. Lifecycle and Inventory Relationship

The rental lifecycle directly affects inventory.

Conceptually:

Available
   ↓
Reserved
   ↓
Rented
   ↓
Returned
   ↓
Inspection
   ↓
Available

or:

Returned
   ↓
Inspection
   ↓
Repair Required
   ↓
Under Repair
   ↓
Available

The exact inventory-state implementation may differ.

The important principle is that rental state and inventory state must remain logically consistent.

50. Lifecycle and Financial Relationship

The rental lifecycle also affects financial state.

Conceptually:

Rental Created
      ↓
Price Determined
      ↓
Payment
      ↓
Deposit Held
      ↓
Rental Active
      ↓
Return
      ↓
Late/Damage Evaluation
      ↓
Settlement
      ↓
Deposit Refund/Deduction
      ↓
Financial Completion

Financial state should not be treated as a separate disconnected workflow.

51. Lifecycle and Customer Communication

Important lifecycle events may trigger customer communication.

Potential events include:

Rental confirmed.
Payment confirmed.
Pickup scheduled.
Delivery scheduled.
Return approaching.
Rental overdue.
Return received.
Deposit settled.
Refund initiated.
Additional charge applied.

The exact communication channels are not prescribed here.

52. Exceptional Lifecycle Paths

The system should be capable of handling situations that do not follow the normal path.

Examples include:

Payment failure.
Product unavailable.
Customer cancellation.
Late return.
Damaged product.
Missing accessory.
Product lost.
Failed delivery.
Failed pickup.
Disputed charge.
Failed settlement.
Product requiring repair.

Exceptional workflows should preserve data integrity and should not create impossible rental states.

53. Lost Product

A lost product may require a special operational path.

Conceptually:

Active Rental
      ↓
Product Not Returned
      ↓
Loss Identified
      ↓
Investigation / Resolution
      ↓
Financial Settlement
      ↓
Inventory Adjustment

The exact policy and financial treatment are business-rule decisions.

The lifecycle should nevertheless be capable of representing such an outcome.

54. Disputed Return or Charge

A customer may dispute:

Damage assessment.
Late fee.
Deposit deduction.
Other applicable charges.

The product may eventually require a dispute-resolution workflow.

This is not necessarily a core hackathon feature.

However, the lifecycle should avoid making future dispute handling impossible.

55. Lifecycle History

Important lifecycle events should remain traceable.

Historical information may include:

State changes.
Pickup.
Return.
Inspection.
Late status.
Fee calculation.
Deposit settlement.
Inventory changes.
Repair transitions.

This history is useful for:

Customer support.
Business operations.
Debugging.
Analytics.
Auditing.
Dispute resolution.

The exact event-history implementation belongs to architecture.

56. Lifecycle Completion Principle

The rental lifecycle is complete when the rental has reached a stable final business state.

That generally means:

The product has been returned or otherwise resolved.
Inspection requirements are complete.
Financial settlement is complete.
Deposit handling is complete.
Inventory has been updated.
Any required repair workflow has been initiated or completed as appropriate.

A rental should not be marked complete merely because the product was physically returned.

57. Lifecycle Design Principle

The rental lifecycle should be:

Predictable.
Traceable.
Consistent.
Secure.
Recoverable.
Automation-friendly.
Customer-understandable.
Operationally useful.

The lifecycle should provide a stable foundation for:

Business rules.
Database design.
APIs.
Dashboard behavior.
Notifications.
Analytics.
Future automation.
58. Implementation Freedom

This document intentionally does not prescribe:

Exact state names.
A specific state-machine library.
Database tables.
API endpoints.
Frontend components.
Backend services.
Event-bus architecture.
Queue architecture.
WebSocket implementation.
Caching strategy.

The implementation should represent the lifecycle accurately while choosing the simplest robust architecture appropriate for the product.

59. Final Lifecycle Principle

The central idea is:

A rental is a complete operational lifecycle, not a single transaction.

RentIt should maintain a coherent connection between:

Customer → Product → Rental Period → Availability → Payment → Deposit → Fulfillment → Active Rental → Return → Inspection → Late/Damage Evaluation → Settlement → Inventory → Repair/Recovery

Every major feature of RentIt should fit into this lifecycle or clearly support it.