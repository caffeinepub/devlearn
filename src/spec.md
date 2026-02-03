# Specification

## Summary
**Goal:** Fix the app incorrectly showing “Payments are temporarily disabled” by default, and enable Stripe checkout when Stripe is configured.

**Planned changes:**
- Remove the hardcoded global payments disable flag so payments are not disabled in production by default.
- Drive the payments enabled/disabled state from runtime conditions based on backend Stripe configuration status (and an explicit bypass flag when enabled).
- Update the frontend payment gating logic (PaymentDialog and checkout session creation) to use the runtime payments-disabled state instead of a hardcoded constant.
- Ensure the footer notice about payments being disabled only appears when payments are actually disabled at runtime.

**User-visible outcome:** When Stripe is configured, users can proceed to checkout and see the normal “Pay Now” flow; when Stripe is not configured, the UI clearly indicates payments are disabled and prevents checkout initiation (English messaging unchanged).
