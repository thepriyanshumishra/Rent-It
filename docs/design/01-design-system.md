# RentIt — Design System

> This document defines the visual language, interaction principles, branding direction, component philosophy, responsive behavior, and UX standards for RentIt. It intentionally provides design principles and reusable patterns rather than prescribing every screen or pixel-level implementation.

---

# 1. Purpose

RentIt is an enterprise-oriented rental-management platform.

The interface should communicate:

- Professionalism.
- Reliability.
- Simplicity.
- Operational efficiency.
- Trust.
- Modern software quality.

The visual direction should be strongly inspired by the provided Odoo references while maintaining a distinct RentIt identity.

---

# 2. Design Philosophy

The core design philosophy is:

> **Odoo-inspired enterprise usability with a distinct RentIt identity.**

RentIt should feel familiar to users who understand modern business software while remaining visually recognizable as RentIt.

The design should prioritize:

1. Clarity.
2. Consistency.
3. Efficiency.
4. Responsiveness.
5. Accessibility.
6. Visual hierarchy.
7. Information density without clutter.
8. Fast interaction.
9. Strong feedback.
10. Brand identity.

---

# 3. Odoo Inspiration

The provided Odoo screenshots are visual and interaction references.

They should influence:

- Navigation.
- Application structure.
- Information hierarchy.
- Administrative dashboards.
- List views.
- Kanban views.
- Forms.
- Search.
- Filters.
- Status indicators.
- Workspace organization.
- Enterprise-oriented presentation.

The screenshots should NOT be interpreted as instructions to reproduce Odoo exactly.

---

# 4. RentIt Identity

RentIt should have a recognizable identity.

The product name is:

# RentIt

The visual identity should follow the conceptual structure:

```text
Rent + It

with:

Rent as the primary brand word.
It as the secondary word.

The intended brand treatment is inspired by Odoo's wordmark structure.

5. Logo Direction

The primary logo concept is:

R

inside or represented through a circular visual treatment inspired by the Odoo "O" concept.

The RentIt logo should use the project's primary purple identity.

Conceptually:

    ◯
    R

The exact logo geometry may evolve during implementation.

The design agent should be free to create a polished interpretation rather than mechanically reproducing Odoo's logo.

6. Wordmark

The wordmark should conceptually follow:

RentIt

with:

Rent

using the primary brand color and:

It

using a neutral gray or dark neutral.

The final typography, weight, spacing, and exact color values may be refined during implementation.

7. Brand Personality

RentIt's visual personality should be:

Professional.
Modern.
Approachable.
Efficient.
Clean.
Enterprise-ready.
Slightly playful through branding.
Not overly corporate.
Not visually noisy.

Avoid:

Excessive gradients.
Excessive glassmorphism.
Excessive animations.
Overly decorative UI.
Gaming-style interfaces.
Unnecessary visual effects.
8. Color Philosophy

Purple is the primary RentIt brand direction.

The palette should include:

Primary

Purple / brand accent.

Used for:

Logo.
Primary actions.
Active navigation.
Important interactive elements.
Brand highlights.
Neutral

A carefully selected neutral scale should support:

Text.
Backgrounds.
Borders.
Cards.
Secondary information.
Semantic Colors

Additional colors should communicate meaning:

Success.
Warning.
Error.
Information.

Semantic colors should be used consistently.

9. Color Usage Principle

Color should communicate hierarchy and meaning.

Do not make every element colorful.

A strong enterprise interface should primarily use:

Neutral foundation
+
Purple accent
+
Semantic status colors

This keeps the interface visually controlled.

10. Purple Usage

Purple should be treated as an accent rather than a background for everything.

Good uses:

Primary buttons.
Active navigation.
Selected states.
Links.
Important highlights.
Brand elements.

Avoid turning the entire interface purple.

11. Light Theme

The primary interface should support a clean light theme.

The light theme should use:

Light neutral backgrounds.
White or near-white surfaces.
Dark readable text.
Subtle borders.
Purple accents.

The interface should avoid excessive pure-white surfaces stacked without hierarchy.

12. Dark Theme

Dark theme support may be provided if appropriate.

If implemented, it should not simply invert the light theme.

The dark theme should maintain:

Readability.
Contrast.
Semantic colors.
Purple identity.
Clear hierarchy.
13. Typography

Typography should prioritize:

Readability.
Professional appearance.
Clear hierarchy.
Good rendering across devices.

The exact font family is an implementation decision.

A modern sans-serif family is generally appropriate.

14. Typography Hierarchy

The interface should establish clear levels such as:

Page Title
Section Heading
Subsection Heading
Body
Secondary Text
Caption
Metadata

Typography should communicate hierarchy without relying excessively on font size.

Weight, spacing, and contrast may also establish hierarchy.

15. Body Text

Body text should be:

Comfortable to read.
Moderately sized.
Clearly contrasted.
Appropriately spaced.

Avoid excessively small text for important information.

16. Financial Typography

Financial values should have strong visual hierarchy.

Examples:

₹12,500
₹3,000 deposit
₹1,200 late fee

Important totals should be visually distinguishable from supporting information.

17. Status Typography

Statuses should generally be represented using:

Text.
Badge/chip.
Optional semantic color.

Status meaning should not depend solely on color.

Example:

● Active
● Overdue
● Completed

The text remains the primary semantic signal.

18. Spacing Philosophy

The interface should use a consistent spacing system.

Spacing should create:

Grouping.
Hierarchy.
Breathing room.
Predictability.

Avoid arbitrary spacing values throughout the application.

19. Layout Philosophy

The interface should generally follow:

Navigation
    ↓
Page Header
    ↓
Primary Context / Actions
    ↓
Main Content
    ↓
Supporting Information

The exact layout should adapt according to the screen and workflow.

20. Information Density

RentIt is business software.

Therefore, information density should be higher than a marketing website.

However:

Dense does not mean cluttered.

Information should be grouped logically and visually separated.

21. Administrative Interface

The administrative interface should optimize for:

Fast scanning.
Fast navigation.
Fast filtering.
Fast editing.
Fast operational decisions.

Common patterns should include:

Sidebar navigation.
Search.
Filters.
Tables.
Kanban.
Forms.
Dashboard cards.
Detail views.
22. Customer Interface

The customer interface should prioritize:

Simplicity.
Trust.
Clear pricing.
Clear availability.
Easy rental selection.
Simple checkout.
Rental visibility.

The customer should not need to understand the internal operational model.

23. Navigation

Navigation should provide clear access to major application areas.

Potential admin navigation areas include:

Dashboard
Rentals
Products
Inventory
Customers
Quotations
Payments
Returns
Repairs
Reports
Settings

This is a conceptual starting point.

The final navigation structure should be determined by actual feature requirements and usability.

24. Navigation Hierarchy

Navigation should communicate:

Application
    ↓
Module
    ↓
View
    ↓
Record

Users should always have enough context to understand where they are.

25. Sidebar

A sidebar may be used for the primary administrative navigation.

It should:

Remain visually clean.
Support active-state indication.
Support collapse/expansion where useful.
Avoid unnecessary nesting.
Remain usable on smaller screens.
26. Mobile Navigation

On smaller screens, desktop navigation should adapt rather than simply becoming compressed.

Possible patterns include:

Drawer.
Bottom navigation for customer workflows.
Collapsible navigation.
Contextual navigation.

The implementation should choose the pattern that best fits the workflow.

27. Page Header

A page header should generally communicate:

Where the user is.
What the page represents.
Important contextual information.
Primary actions.

Conceptually:

Page Title
Supporting context

                    Primary Action
28. Primary Actions

Each important screen should have a visually clear primary action where appropriate.

Examples:

Create Rental
Add Product
Process Return
Confirm Payment
Start Repair

Primary actions should not compete visually with numerous secondary actions.

29. Secondary Actions

Secondary actions should remain accessible without visually overpowering the primary action.

Examples:

Edit.
Export.
Duplicate.
Archive.
View history.
30. Destructive Actions

Destructive operations should:

Be visually distinguishable.
Require appropriate confirmation where necessary.
Clearly explain the consequence.

Examples:

Delete.
Cancel.
Refund.
Remove inventory.
Irreversible changes.
31. Buttons

Buttons should have a consistent hierarchy.

Conceptually:

Primary
Secondary
Tertiary / Ghost
Destructive

Avoid using the same visual weight for every action.

32. Forms

Forms should be:

Clearly structured.
Grouped logically.
Easy to scan.
Responsive.
Accessible.

Fields should have meaningful labels.

33. Form Grouping

Related fields should be grouped.

For example:

Customer Information

Rental Details

Pricing

Deposit

Fulfillment

Notes

Avoid presenting a large unstructured wall of fields.

34. Form Validation

Validation should provide:

Clear indication of the problematic field.
Understandable explanation.
Useful correction guidance.

Validation should occur at appropriate interaction points.

Critical validation must also exist on the trusted application side.

35. Tables

Tables are important for administrative workflows.

They should support where useful:

Sorting.
Filtering.
Search.
Pagination.
Selection.
Status.
Row actions.
36. Table Density

Administrative tables may use relatively compact spacing to support efficient scanning.

However, readability remains more important than maximum density.

37. Table Columns

Only useful columns should be displayed by default.

Users should not be forced to scan irrelevant information.

Where appropriate, columns may be configurable.

38. Empty States

Empty states should communicate:

What is empty.
Why it may be empty.
What the user can do next.

Example:

No rentals yet.

Create your first rental to start managing your rental workflow.
39. Loading States

Loading states should prevent users from interpreting incomplete data as final data.

Use appropriate patterns such as:

Skeletons.
Spinners.
Progress indicators.

Avoid excessive loading animations.

40. Error States

Error states should be:

Clear.
Specific where possible.
Actionable.

Example:

Unable to load rental information.

Try again.

If the user can correct the issue, explain how.

41. Success Feedback

Successful operations should provide appropriate confirmation.

Examples:

Rental confirmed.
Payment recorded.
Return processed.
Repair started.

Feedback should be noticeable without being disruptive.

42. Notifications / Toasts

Toast notifications may be used for short-lived feedback.

They should not contain critical information that disappears before the user can reasonably read it.

43. Modals

Modals should be used selectively.

Good uses include:

Confirmation.
Short focused actions.
Quick edits.
Important warnings.

Avoid placing complex workflows inside deeply nested modals.

44. Drawers

Drawers may be useful for:

Quick record inspection.
Contextual editing.
Filters.
Secondary information.

They should not become an alternative navigation system without a clear reason.

45. Cards

Cards may be used for:

Dashboard metrics.
Product summaries.
Rental summaries.
Important grouped information.

Cards should support hierarchy rather than simply wrapping every section in a box.

46. Dashboard Design

The dashboard should prioritize actionable information.

Potential sections include:

Active Rentals
Overdue Rentals
Due Today
Revenue
Deposits Held
Inventory Issues
Recent Rentals
Operational Alerts

The exact dashboard composition should be determined by the actual requirements and available data.

47. Dashboard Principle

A dashboard should answer:

"What is happening, and what needs my attention?"

It should not merely display decorative charts.

48. Kanban Views

Kanban is particularly appropriate for operational workflows.

Potential examples:

Rental Pipeline

Draft
Confirmed
Active
Due
Overdue
Returned
Completed

or:

Repair Pipeline

Pending
In Repair
Awaiting Parts
Completed
Ready

The actual states should follow the authoritative business model.

49. Kanban Cards

Kanban cards should expose the most useful information without becoming miniature pages.

Possible information:

Record name/ID.
Customer.
Product.
Status.
Important date.
Amount.
Priority.
50. Detail Views

Detail pages should present a record as a coherent business object.

For a rental:

Rental Header
    ↓
Customer
    ↓
Rental Items
    ↓
Rental Period
    ↓
Financial Information
    ↓
Fulfillment
    ↓
Return / Inspection
    ↓
Settlement
    ↓
History
51. Record Header

A record detail header should communicate:

Record identity.
Current state.
Important metadata.
Primary actions.

Example:

Rental #RNT-1024
Active

Customer: Priyanshu
Return: 12 Aug, 5:00 PM

[Process Return]

The exact content should adapt to the record.

52. Timeline / History

Important business records may benefit from a timeline showing meaningful events.

Example:

10 Aug — Rental Confirmed
10 Aug — Payment Received
10 Aug — Pickup Completed
12 Aug — Return Recorded
12 Aug — Inspection Completed
12 Aug — Deposit Settled

The timeline should focus on meaningful business events rather than every minor UI action.

53. Search

Search should be easy to discover and fast to use.

Possible searchable concepts include:

Product.
Customer.
Rental.
Rental ID.
Invoice.
Payment.

Search should prioritize useful business identifiers.

54. Filtering

Filtering should allow users to narrow large datasets.

Examples:

Status
Customer
Date
Product
Payment State
Rental State
Location

Only relevant filters should be exposed on each screen.

55. Sorting

Sorting should support useful operational ordering.

Examples:

Newest.
Oldest.
Due soon.
Overdue.
Highest value.
Recently updated.
56. Breadcrumbs

Breadcrumbs may be useful for deeper administrative navigation.

Example:

Rentals
  / Active
  / Rental #1024

They should be used when they improve orientation.

57. Responsive Design

RentIt must be responsive.

The interface should adapt across:

Mobile
Tablet
Laptop
Desktop
Large Desktop
58. Responsive Principle

Responsive design should not mean:

"Shrink the desktop UI."

Instead:

Recompose the interface according to the available space and user context.

59. Mobile Customer Experience

On mobile:

Product information should remain readable.
Rental dates should be easy to select.
Pricing should remain visible.
Checkout should be simple.
Important actions should be reachable.
60. Mobile Admin Experience

The admin interface may prioritize different information on mobile.

Dense tables may transform into:

Stacked cards.
Compact list items.
Horizontal scrolling where justified.
Dedicated detail views.

Do not force a desktop table into an unusable narrow screen.

61. Responsive Tables

When a table becomes too wide, the implementation may choose among:

Horizontal scrolling.
Column prioritization.
Responsive cards.
Alternate mobile layout.

The best choice depends on the information.

62. Responsive Forms

Forms should adapt naturally.

Desktop:

[Field] [Field]
[Field] [Field]

Mobile:

[Field]
[Field]
[Field]
[Field]

The exact layout is implementation-dependent.

63. Accessibility

Accessibility should be part of the design system.

The UI should provide:

Keyboard navigation.
Visible focus.
Semantic structure.
Clear labels.
Appropriate contrast.
Accessible error messages.
Screen-reader-friendly interaction where practical.
64. Color Accessibility

Color should not be the only way information is communicated.

For example:

Bad:

Red = overdue
Green = active

Better:

⚠ Overdue
✓ Active

with color reinforcing the meaning.

65. Focus States

Interactive elements should have visible focus states.

Focus should not disappear simply because the interface prioritizes visual minimalism.

66. Motion

Animation should be subtle and purposeful.

Appropriate uses include:

Page transitions.
Expanding sections.
Modal appearance.
Loading transitions.
Feedback.

Avoid:

Excessive motion.
Decorative animations that slow workflows.
Animation on every interaction.
67. Microinteractions

Microinteractions can improve perceived quality.

Examples:

Button feedback.
Hover states.
Selection states.
Toggle transitions.
Success confirmation.

They should remain subtle.

68. Hover States

Hover states are useful on desktop but must not be the only indication of interactivity.

Touch devices do not have hover in the same way.

69. Interaction Feedback

Every meaningful action should provide appropriate feedback.

Examples:

Click
 ↓
Loading
 ↓
Success / Error

Users should not be left wondering whether an operation occurred.

70. Optimistic UI

Optimistic UI may be used where the operation is low-risk and reversible.

It should be avoided for high-risk financial or inventory operations unless the underlying architecture can guarantee consistency.

71. Financial UI

Financial information should be exceptionally clear.

For example:

Rental Charge      ₹5,000
Security Deposit   ₹2,000
Late Fee              ₹0
-------------------------
Total               ₹7,000

The exact presentation may vary.

The principle is clarity.

72. Deposit UI

Security deposits should be visually distinguished from rental charges.

Users should understand:

Rental Cost

and:

Refundable Deposit

are different financial concepts.

73. Late Fee UI

Late fees should be transparent.

If applicable, show:

Due date.
Actual return date.
Overdue duration.
Applicable fee.
Maximum fee where relevant.

Avoid surprising customers with unexplained charges.

74. Availability UI

Availability should be easy to understand.

Possible states:

Available
Limited Availability
Unavailable
Reserved

The exact labels should reflect actual business state.

75. Rental Status UI

Rental statuses should be consistent across:

Dashboard.
Rental list.
Rental detail.
Customer portal.
Notifications.

The same business state should not have five unrelated visual meanings.

76. Product Cards

Customer-facing product cards may contain:

Image.
Product name.
Short description.
Rental price.
Availability.
Primary action.

Avoid excessive information.

77. Product Detail

A product detail page should prioritize:

Product Identity
Images
Description
Rental Price
Availability
Rental Period
Deposit
Primary Rental Action

Supporting information may follow.

78. Checkout

Checkout should provide a clear sequence:

Rental Details
      ↓
Customer / Fulfillment
      ↓
Pricing
      ↓
Deposit
      ↓
Payment
      ↓
Confirmation

The exact UI may be a single page or multi-step flow.

79. Checkout Principle

The customer should always understand:

What they are renting.
For how long.
What it costs.
What deposit is required.
What happens next.
80. Confirmation

After successful rental confirmation, the interface should clearly communicate:

Rental identifier.
Product(s).
Rental period.
Amount paid.
Deposit.
Pickup/delivery information.
Next action.
81. Customer Rental Dashboard

The customer should be able to quickly understand:

Active Rentals
Upcoming Rentals
Overdue Rentals
Completed Rentals

The interface should prioritize current actions.

82. Admin Rental Dashboard

The admin should be able to understand:

Active
Due Soon
Overdue
Returned
Pending Settlement
Completed

The exact views should follow the business workflow.

83. Inventory Interface

Inventory screens should prioritize operational information.

Useful information may include:

Product.
Unit.
Status.
Current rental.
Condition.
Repair state.
Location.
84. Inventory Visual States

Inventory states should be visually distinguishable.

For example:

Available
Reserved
Rented
Inspection
Repair
Unavailable

Use text + semantic styling.

85. Return Interface

The return interface should guide staff through:

Identify Rental
      ↓
Confirm Returned Items
      ↓
Record Actual Return
      ↓
Inspect
      ↓
Record Issues
      ↓
Calculate Charges
      ↓
Settlement

The UI should make the workflow feel connected.

86. Inspection Interface

Inspection should allow staff to efficiently record:

Condition.
Damage.
Missing components.
Notes.
Evidence.

The UI should prioritize speed because inspections may be repeated frequently.

87. Repair Interface

Repair management may use:

Kanban.
List.
Detail.

The interface should communicate:

What needs repair.
Why.
Current status.
Priority.
Expected completion.
88. Empty and Exceptional States

Design must account for:

No data.
Loading.
Errors.
Permission restrictions.
Unavailable inventory.
Payment failure.
Conflicting availability.
Failed settlement.

A polished product designs these states intentionally rather than only designing the happy path.

89. Permission-Based UI

The frontend should hide or disable actions the user cannot perform where appropriate.

However:

UI visibility is not authorization.

The backend must enforce the actual permission.

90. Data Privacy in UI

Do not expose information simply because it exists in the backend.

For example:

Customers should not see:

Internal notes.
Internal repair details where inappropriate.
Other customers' information.
Administrative-only financial information.
91. Consistency Principle

A component should behave consistently everywhere.

For example:

If a purple filled button means "primary action" on one page, it should not mean "destructive action" on another page.

92. Reusable Components

The design system should encourage reusable components such as:

Button
Input
Select
Date Picker
Modal
Drawer
Badge
Card
Table
Tabs
Dropdown
Toast
Pagination
Search
Filter
Empty State
Loading State

The final component library may differ.

93. Component Abstraction Principle

Not every UI element needs to become a reusable component.

Create reusable abstractions when:

The pattern repeats.
Consistency matters.
Behavior is non-trivial.
Accessibility needs centralized handling.

Avoid abstraction for abstraction's sake.

94. Design Tokens

The implementation should ideally centralize reusable design values.

Potential tokens include:

Colors
Typography
Spacing
Radius
Shadows
Borders
Motion
Breakpoints

The exact token structure is implementation-dependent.

95. Border Radius

Rounded corners should be used consistently.

Avoid mixing:

Sharp
Slightly Rounded
Highly Rounded
Pill

without a clear reason.

Pill-shaped elements should generally be reserved for:

Status badges.
Tags.
Compact controls.
96. Shadows

Shadows should communicate hierarchy rather than decorate every surface.

Use them selectively for:

Floating elements.
Modals.
Menus.
Elevated cards where appropriate.
97. Borders

Borders should be subtle and purposeful.

They may separate:

Table rows.
Cards.
Form sections.
Navigation.
Input fields.

Avoid excessive boxed-in layouts.

98. Icons

Icons should support understanding rather than replace important labels.

Important actions should generally have accessible text or equivalent accessible labeling.

99. Icon Consistency

Use a coherent icon style throughout the product.

Do not mix unrelated icon families.

100. Images

Product images should be:

Consistent.
Appropriately cropped.
Responsive.
Optimized for performance.

Image presentation should support product recognition.

101. Image Loading

Large images should not unnecessarily block the interface.

Appropriate loading and optimization strategies should be used.

102. Design Performance

Visual quality must not come at the cost of unnecessary performance problems.

Avoid:

Huge unoptimized images.
Excessive animations.
Unnecessary JavaScript-heavy effects.
Excessive DOM complexity.
103. Desktop Information Architecture

The desktop admin experience may use a relatively information-dense layout.

Example conceptual structure:

┌───────────────────────────────────────────────┐
│ RentIt                         User / Actions │
├──────────────┬────────────────────────────────┤
│              │ Page Header                    │
│ Navigation   │                                │
│              │ Main Content                   │
│              │                                │
│              │                                │
└──────────────┴────────────────────────────────┘

The exact layout should evolve from usability testing and the actual application structure.

104. Customer Information Architecture

The customer experience should generally be simpler:

Home
 ↓
Products
 ↓
Product Detail
 ↓
Rental Selection
 ↓
Checkout
 ↓
My Rentals

The customer should not be exposed to administrative complexity.

105. Design System Evolution

The design system should evolve as the application grows.

If a repeated UI pattern appears multiple times:

Identify the pattern.
Determine whether it should become a reusable component.
Define its states.
Update the design system.
Refactor where useful.
106. Odoo Reference Usage

The docs/inspiration/ images should be treated as visual references.

The AI agent should inspect them when making UI decisions.

The references can inform:

Layout.
Spacing.
Navigation.
Density.
Component composition.
Dashboard patterns.
Enterprise visual language.

They should not be treated as immutable specifications.

107. Visual Similarity Principle

The overall RentIt interface should feel recognizably inspired by Odoo.

A user familiar with Odoo should find the interface conceptually familiar.

However, the user should also immediately recognize:

"This is RentIt."

108. Brand Differentiation

RentIt's differentiation should come from:

Purple RentIt branding.
RentIt logo.
Rental-focused information architecture.
Rental-specific workflows.
Product-specific interaction patterns.
Its own visual refinements.
109. Design Freedom

The AI agent may:

Improve spacing.
Improve hierarchy.
Adjust component proportions.
Refine colors.
Improve responsiveness.
Introduce better interaction patterns.
Create new components.
Improve accessibility.
Improve visual polish.

provided that these changes remain consistent with the design philosophy.

110. No Pixel-Lock

This document does not require every screen to use fixed:

Dimensions.
Positions.
Colors.
Component counts.
Layout structures.

The design should evolve based on actual usability.

111. No Unnecessary UI Complexity

Do not add:

Extra dashboards.
Extra charts.
Extra filters.
Extra animations.
Extra cards.
Extra navigation levels.

unless they improve the actual user experience.

112. Design Review Questions

Before considering a major UI feature complete, ask:

Hierarchy

Can the user immediately identify the most important information?

Action

Can the user identify what to do next?

Consistency

Does the feature follow existing RentIt patterns?

Responsiveness

Does it work on different screen sizes?

Accessibility

Can users interact with it effectively without relying solely on color or mouse interaction?

Feedback

Does the user understand whether an action succeeded or failed?

Performance

Does the UI avoid unnecessary rendering or loading?

Brand

Does it feel like RentIt?

Odoo Inspiration

Does it maintain the intended enterprise/Odoo-inspired quality?

113. Design Quality Gate

A major screen should ideally satisfy:

Clear
+
Consistent
+
Responsive
+
Accessible
+
Fast
+
Actionable
+
Brand-consistent
114. Final Design Principle

RentIt's design should feel:

Professional without being boring.

Modern without being trendy for the sake of trends.

Dense without being cluttered.

Simple without being simplistic.

Odoo-inspired without being a clone.

Branded without being visually loud.

Responsive without feeling like a compressed desktop site.

115. Final Design Statement

The intended visual experience is:

Odoo-inspired enterprise UX
            +
RentIt purple identity
            +
Rental-focused workflows
            +
Modern responsive design
            +
Clear information hierarchy
            +
Fast operational interaction

The result should feel like a product that could plausibly exist as a serious rental-management application rather than a generic hackathon dashboard.

116. Final Rule for AI Design Agents

The most important instruction is:

Use this document to understand how RentIt should feel, not as a rigid script for how every pixel must be placed.

The AI agent should use:

The requirements.
The business rules.
The architecture.
The data model.
The Odoo reference images.
This design system.

to make informed design decisions.

When there is no explicit requirement, prefer the design that provides the best combination of:

clarity + usability + consistency + responsiveness + accessibility + visual quality.

Do not sacrifice good UX merely to imitate a reference.

Do not sacrifice RentIt's identity merely to imitate Odoo.

Do not add visual complexity merely to make the interface appear impressive.

The objective is:

A polished, coherent, Odoo-inspired RentIt experience that feels intentionally designed rather than copied.