# RentIt — User Roles and Permissions

> This document defines the user types, responsibilities, access boundaries, and permission principles for RentIt. It describes who should be able to perform which kinds of actions without prescribing a specific authentication or authorization implementation.

---

# 1. Purpose

RentIt has multiple types of users with different responsibilities.

The system must ensure that each user can access the information and operations appropriate to their role while preventing unauthorized access to protected functionality.

The primary roles currently identified are:

1. Customer / Portal User
2. Admin / Rental Manager

The permission model should remain extensible so additional operational roles can be introduced later if the product requires them.

---

# 2. Permission Philosophy

Permissions should be based on responsibility rather than simply on whether a user can see a particular page.

The system should distinguish between:

- Viewing information.
- Creating records.
- Modifying records.
- Performing operational actions.
- Performing financial actions.
- Configuring business rules.
- Managing other users.
- Managing system-wide data.

A user being unable to see a UI control must never be considered sufficient authorization.

The underlying operation must also be protected.

---

# 3. Customer / Portal User

## 3.1 Role Description

The Customer / Portal User is an individual who uses RentIt to rent products and manage their own rental activities.

The customer should primarily have access to information and operations related to their own account and rentals.

---

# 4. Customer Account Capabilities

A customer should be able to:

- Register an account.
- Log in.
- Log out.
- Access their profile.
- Update appropriate profile information.
- Manage their addresses.
- Manage relevant contact information.
- Manage their profile image where supported.

Customers should not be able to access another customer's private information.

---

# 5. Customer Product Capabilities

Customers should be able to:

- Browse rental products.
- View relevant product information.
- View applicable rental pricing.
- View availability information.
- View product variants and attributes where applicable.
- Select products for rental.

Customers should not be able to modify the underlying product catalog unless they are explicitly granted an administrative capability.

---

# 6. Customer Rental Capabilities

Customers should be able to:

- Select rental periods.
- Add rental products to their cart.
- Review rental selections.
- Choose applicable delivery or pickup options.
- Submit rental requests/orders.
- View their own rentals.
- View rental status.
- View relevant rental dates.
- View relevant payment information.
- View applicable security-deposit information.
- View return information.
- View applicable settlement information.

Customers should not be able to modify another customer's rental.

---

# 7. Customer Payment Capabilities

Customers should be able to initiate and complete payment through the supported rental workflow.

They should be able to view relevant payment information associated with their own rentals.

Customers should not be able to:

- Modify another user's payment.
- Modify payment records directly.
- Change authoritative financial records through client-side actions.
- Manipulate security-deposit values.
- Mark payments as completed without an authorized financial operation.

Financial state must always be controlled by trusted application logic.

---

# 8. Customer Security Deposit Capabilities

Customers should be able to view information about security deposits associated with their own rentals.

This may include:

- Deposit amount.
- Deposit status.
- Deposit deductions.
- Refund amount.
- Settlement status.

Customers should not be able to directly alter:

- Deposit amount.
- Deduction amount.
- Refund amount.
- Settlement status.

Those operations must remain under authorized system/business logic.

---

# 9. Customer Return Capabilities

Customers should be able to participate in the return process according to the supported rental workflow.

Depending on the implementation, this may include:

- Viewing return instructions.
- Viewing expected return time.
- Initiating or confirming a return where appropriate.
- Viewing return status.
- Viewing inspection/settlement status where appropriate.

Customers should not be able to mark a product as successfully inspected or waive a damage/late fee themselves.

Those are operational/business decisions.

---

# 10. Customer Invoice Capabilities

Customers should be able to access invoices associated with their own rental activity where applicable.

They should not be able to access invoices belonging to unrelated customers.

---

# 11. Customer Data Isolation

A customer should only be able to access data they are authorized to access.

At minimum, customer-specific information should be isolated for:

- Profile.
- Addresses.
- Rentals.
- Orders.
- Payments.
- Security deposits.
- Invoices.
- Returns.
- Settlement information.

The backend must enforce this isolation.

---

# 12. Admin / Rental Manager

## 12.1 Role Description

The Admin / Rental Manager is responsible for operating the rental business through RentIt.

The admin requires broad access to operational information and business configuration.

The admin should be able to manage the rental lifecycle from a centralized operational environment.

---

# 13. Admin Dashboard Access

The admin should have access to the operational dashboard.

The dashboard may include information such as:

- Active rentals.
- Rentals due today.
- Upcoming pickups.
- Upcoming returns.
- Overdue rentals.
- Rental revenue.
- Security deposits held.
- Late-fee collection.
- Inventory availability.
- Other operational insights.

The dashboard should help the admin identify priorities and take action.

---

# 14. Admin Customer Management

The admin should be able to access and manage customer records required for rental operations.

This may include:

- Viewing customers.
- Viewing customer profiles.
- Reviewing customer rental history.
- Reviewing relevant addresses.
- Reviewing relevant payment/rental information.
- Supporting customer-related operational tasks.

The admin should still follow appropriate data-protection and access principles.

Broad access does not mean unrestricted access to every possible internal system detail.

---

# 15. Admin Product Management

The admin should be able to manage rental products.

Capabilities may include:

- Creating products.
- Viewing products.
- Updating products.
- Managing product attributes.
- Managing product variants.
- Managing product availability.
- Managing rental configuration.
- Managing product-related operational information.

The exact product-management capabilities may evolve as the data model is finalized.

---

# 16. Admin Rental Management

The admin should be able to manage rental records and operational states.

Capabilities include:

- Viewing rentals.
- Reviewing rental details.
- Monitoring rental status.
- Managing rental operations.
- Identifying upcoming rentals.
- Identifying due rentals.
- Identifying overdue rentals.
- Supporting pickup operations.
- Supporting return operations.
- Supporting settlement.

Administrative rental actions must follow the defined rental lifecycle and business rules.

---

# 17. Admin Pricing Management

The admin should be able to manage pricing-related configuration.

This may include:

- Default pricing.
- Multiple pricelists.
- Time-specific pricing.
- Product-specific pricing.
- Relevant variant pricing.

Pricing configuration should be protected from unauthorized modification.

---

# 18. Admin Rental Period Management

The admin should be able to configure rental periods used by the business.

Changes to rental-period configuration may affect:

- Pricing.
- Availability.
- Rental creation.
- Due dates.
- Late-fee calculations.
- Operational scheduling.

Therefore, rental-period changes should be handled carefully and consistently.

---

# 19. Admin Security Deposit Management

The admin should have access to security-deposit operations.

Capabilities may include:

- Configuring deposit requirements.
- Viewing deposits.
- Reviewing deposit payment status.
- Viewing deposit history.
- Performing authorized settlement actions.
- Recording or approving deductions where applicable.
- Processing refunds through the supported workflow.

The exact approval model may evolve if additional operational roles are introduced.

---

# 20. Admin Late-Fee Management

The admin should be able to configure and manage late-return rules.

This may include:

- Charging interval.
- Grace period.
- Maximum late fee.
- Applicable penalty configuration.

The admin should also be able to:

- Identify overdue rentals.
- Review calculated late fees.
- Review outstanding penalties.
- Manage authorized settlement operations.

The exact calculation logic belongs to the business-rules documentation.

---

# 21. Admin Pickup Management

The admin should have access to pickup operations.

Capabilities may include:

- Viewing scheduled pickups.
- Organizing pickup activities.
- Confirming pickups.
- Reviewing pickup details.
- Using identification mechanisms such as QR/barcodes where implemented.
- Managing pickup checklists where implemented.

The exact operational workflow should remain flexible.

---

# 22. Admin Return Management

The admin should be able to manage returns.

Capabilities may include:

- Viewing scheduled returns.
- Confirming returns.
- Inspecting products.
- Recording product condition.
- Recording damage.
- Recording missing accessories.
- Triggering applicable settlement processes.
- Updating inventory.
- Initiating repair workflows when necessary.

A return should not automatically imply that the product is immediately available.

---

# 23. Admin Inventory Capabilities

The admin should be able to monitor and manage inventory-related information.

This may include:

- Product availability.
- Rental status.
- Returned products.
- Damaged products.
- Products under repair.
- Product re-availability.

Inventory state should remain consistent with rental operations.

---

# 24. Admin Repair Capabilities

Where a returned product requires repair, the admin should be able to support the appropriate repair workflow.

This may include:

- Identifying damaged products.
- Recording repair requirements.
- Tracking repair status.
- Keeping the product unavailable while required.
- Returning the product to available inventory when appropriate.

---

# 25. Admin Quotation Capabilities

The admin should be able to create and manage quotations for rental operations.

Capabilities may include:

- Creating quotations.
- Reviewing quotations.
- Updating quotations.
- Confirming quotations.
- Using quotation templates.
- Supporting the transition from quotation to rental/invoice workflow.

Quotation permissions should be protected because quotations may represent commercial commitments.

---

# 26. Offline Rental Operations

The admin should be able to initiate a rental on behalf of a customer.

A typical operational flow is:

```text
Customer arrives
      ↓
Admin creates quotation
      ↓
Quotation confirmed
      ↓
Invoice
      ↓
Payment + Security Deposit
      ↓
Rental
      ↓
Pickup / Handover
      ↓
Return
      ↓
Inspection
      ↓
Settlement

The admin should be able to perform the operational actions required by this workflow.

27. Role Comparison

The following table provides a high-level permission model.

Capability	Customer	Admin
Register account	Yes	N/A
Login	Yes	Yes
Manage own profile	Yes	Yes
View own rentals	Yes	Yes
View all rentals	No	Yes
Browse products	Yes	Yes
Manage products	No	Yes
View product availability	Yes	Yes
Configure rental periods	No	Yes
Select rental period	Yes	Yes
Manage pricing	No	Yes
View applicable pricing	Yes	Yes
Create customer rental	Yes	Yes
Manage another customer's rental	No	Yes
View own payment information	Yes	Yes
Manage payment records directly	No	Authorized operations only
View own deposits	Yes	Yes
Configure deposits	No	Yes
Settle deposits	No	Yes
Configure late fees	No	Yes
View own late fees	Yes	Yes
Manage late fees	No	Yes
View pickups	Own/relevant	Yes
Manage pickups	Limited	Yes
View returns	Own/relevant	Yes
Process returns	Limited	Yes
Perform inspection	No	Yes
Record damage	No	Yes
Manage inventory	No	Yes
Initiate repairs	No	Yes
View own invoices	Yes	Yes
Manage quotations	No	Yes
View operational dashboard	Limited/none	Yes
View business analytics	No	Yes

This table represents the intended product-level access model.

The final technical permission system may implement these capabilities differently.

28. Permission Categories

Permissions should conceptually be grouped by capability rather than being tied only to pages.

Possible categories include:

Account
View profile.
Edit profile.
Manage addresses.
Products
View products.
Manage products.
Manage variants.
Manage availability.
Rentals
Create rental.
View rental.
Modify rental.
Perform operational rental actions.
Payments
View payment information.
Initiate payment.
Perform authorized payment operations.
Deposits
View deposit.
Configure deposit.
Settle deposit.
Process refund/deduction.
Late Fees
View late fees.
Configure rules.
Review penalties.
Perform authorized settlement operations.
Pickup
View pickup.
Schedule pickup.
Confirm pickup.
Manage pickup operations.
Returns
View return.
Confirm return.
Inspect product.
Record damage.
Complete return workflow.
Inventory
View inventory.
Modify inventory through authorized workflows.
Mark products unavailable/available where appropriate.
Repairs
View repair status.
Create repair workflow.
Update repair state.
Pricing
View pricing.
Manage pricelists.
Configure pricing rules.
Quotations
Create quotation.
View quotation.
Modify quotation.
Confirm quotation.
Manage templates.
Analytics
View operational dashboard.
View business analytics.
View financial/operational metrics according to authorization.
29. Ownership and Scope

Not every operation requires the same level of access.

The system should distinguish between:

User-owned data.
Organization-wide operational data.
Configuration data.
Financial data.
Sensitive administrative data.

For example:

A customer may own a rental record from the perspective of their portal access, but the rental remains an operational record controlled by the rental business.

Therefore, customer permissions should not imply unrestricted control over the underlying record.

30. Backend Authorization

Authorization must be enforced at the backend/application boundary.

The system should not rely solely on:

Hidden UI elements.
Disabled buttons.
Frontend routes.
Client-side state.
Client-provided role information.

A malicious or incorrect client request should still be rejected if the authenticated user is not authorized.

31. Resource-Level Authorization

Where appropriate, permissions should apply not only to actions but also to specific resources.

For example:

A customer may be allowed to:

View Rental #123

but not:

View Rental #456

if Rental #456 belongs to another customer.

Similarly, customers should only be able to access their own:

Invoices.
Addresses.
Payments.
Deposits.
Rental records.
Return information.
32. Administrative Actions

Administrative actions can have significant business or financial consequences.

Examples include:

Changing rental pricing.
Changing deposit rules.
Applying a deduction.
Processing a refund.
Closing a rental.
Marking an asset available.
Recording damage.
Initiating repair.
Confirming a quotation.

These operations should be protected appropriately.

The exact level of confirmation, approval, or audit logging should be determined by the architecture and business requirements.

33. Future Role Extensibility

The initial product may operate with the two primary roles:

Customer.
Admin.

However, the permission model should not make future role expansion unnecessarily difficult.

A mature rental business could potentially require roles such as:

Operations Staff.
Pickup/Delivery Staff.
Inventory Staff.
Finance Staff.
Maintenance Staff.
Manager.

These roles are not currently mandatory product requirements.

They should not be implemented merely for theoretical completeness.

The architecture should simply avoid making future role separation impossible.

34. Principle of Least Privilege

Users should receive only the access required for their responsibilities.

Avoid granting broad administrative permissions merely because they are convenient.

At the same time, do not create unnecessarily granular permissions that make the system difficult to operate.

The goal is a practical balance:

Enough access to perform the job efficiently, but no unnecessary authority over unrelated operations.

35. Permission Changes

Permission-related changes should be treated carefully.

Changing permissions can affect:

Customer privacy.
Financial operations.
Inventory.
Rental integrity.
Business configuration.

When implementing permission changes, consider existing users and existing data.

Do not accidentally broaden access through a UI change or API change.

36. Authentication vs Authorization

Authentication answers:

"Who is this user?"

Authorization answers:

"What is this user allowed to do?"

RentIt requires both.

Successful authentication must not automatically grant administrative access.

Administrative permissions should be explicitly determined by the application's authorization model.

37. Auditability

Important administrative and financial actions should be traceable where appropriate.

Potentially auditable operations include:

Deposit settlement.
Refunds.
Late-fee changes.
Pricing changes.
Rental-state changes.
Inventory-state changes.
Damage recording.
Repair transitions.
Quotation confirmation.

The exact audit mechanism is an architectural decision.

The product requirement is that important operations should be sufficiently traceable to support reliability and accountability.

38. Permission Errors

When a user attempts an unauthorized action:

The operation should be rejected.
The system should not expose sensitive information.
The user should receive an understandable error.
The event should be diagnosable by developers/admins where appropriate.

The system should avoid revealing unnecessary information about resources the user is not authorized to access.

39. Role and Permission Design Principle

The permission system should remain:

Secure.
Understandable.
Maintainable.
Extensible.
Consistent with the rental workflow.

It should not become so complex that ordinary business operations require excessive administrative effort.

40. Implementation Freedom

This document does not prescribe:

A particular authentication framework.
A particular authorization library.
A particular token/session strategy.
A particular database permission model.
A particular middleware structure.
A particular frontend permission mechanism.

Those decisions belong to the architecture and engineering process.

The implementation should satisfy the product-level permission requirements while preserving security and maintainability.

41. Final Permission Principle

The central rule is:

Every user should be able to perform the work they are responsible for, while being prevented from performing actions or accessing information outside their authority.

For RentIt, this means:

Customers manage their rental experience.

Administrators manage rental operations.

The system enforces the boundary between them.

The permission model should support the business without unnecessarily constraining future product