# API Checklist

Random thoughts and concerns while on development. Finished items will have **\[Check\]** mark beside it.

- Checkout seat validation, make sure it's still available.
- Checkout same seat check. One order has the same seats orders (A-001-0001, A-001-0001).
- Checkout cancellation event to re-enable ordered seats and expire the sesssion.
- Checkout expiration set to 15 minutes and then manually expire the sesison.
- Fixture's tickets availability check on each successful orders.
- Checkout data prefill. Use customer ID to tell Stripe to prefill checkout inputs.
