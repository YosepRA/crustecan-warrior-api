# API Checklist

Random thoughts and concerns while on development. Finished items will have ✅ mark beside it.

- Checkout seat validation, make sure it's still available.
- Checkout same seat check. One order has the same seats orders (A-001-0001, A-001-0001).
- Checkout seat existence check. Imagine seat A-001-1000 when there is only 200 seat columns across.
- Checkout cancellation event to re-enable ordered seats and expire the sesssion. ✅
- Checkout expiration set to 1 hour and then manually expire the sesison. ✅
- Fixture's tickets availability check on:
  - Session creation.
  - Session cancellation.
  - Ticket fulfillment.
- Checkout data prefill. Use customer ID to tell Stripe to prefill checkout inputs.
- Checkout manual cancel button. Change transaction status to "cancel", expire checkout session, and re-enable seats. ✅
- General error handling. Consider using [Express](https://expressjs.com/en/guide/error-handling.html)-way of using global catcher. Or you can use a `promiseResolver` helper.
- Route-based error handling. Simple ones such as Fixture details not found.
- User get login session to handle unauthenticated session using other method than code 401.
- Add basic caching for fixture and ticket's price.
- Add a "created" property to ticket for sorting.
- Consider splitting ticket and checkout routes since the front-end is using that schema.
