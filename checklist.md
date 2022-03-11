# API Checklist

Random thoughts and concerns while on development. Finished items will have ✅ mark beside it.

- Checkout seat validation, make sure it's still available.
- Checkout same seat check. One order has the same seats orders (A-001-0001, A-001-0001).
- Checkout seat existence check. Imagine seat A-001-1000 when there is only 200 seat columns across.
- Checkout cancellation event to re-enable ordered seats and expire the sesssion. ✅
- Checkout expiration set to 1 hour and then manually expire the sesison. ✅
- Fixture's tickets availability check on: ✅
  - Session creation.
  - Session cancellation.
- Checkout data prefill. Use customer ID to tell Stripe to prefill checkout inputs.
- Checkout manual cancel button. Change transaction status to "cancel", expire checkout session, and re-enable seats. ✅
- General error handling. Consider using [Express](https://expressjs.com/en/guide/error-handling.html)-way of using global catcher. Or you can use a `promiseResolver` helper.
- Route-based error handling. Simple ones such as Fixture details not found.
- User get login session to handle unauthenticated session using other method than code 401.
- Add basic caching for fixture and ticket's price.
- Add a "created" property to ticket for sorting. ✅
- Consider splitting ticket and checkout routes since the front-end is using that schema.
- Set session expiration.
- `app.js` Stripe success and cancel demo routes.
- Consider create Mongoose pagination plugin.
- Add `totalPages` property to pagination-related responses. ✅
- Change transaction status from "complete" to "completed". Remember to change UI's `TransactionCard` (and many other related components) to follow suit.
- Check whether you need the transaction router and controller. (**A:** No, I don't.) ✅
- Consider changing the place of Stripe webhook away from ticket router to make it more specific since it's not solely intended for to tickets, but spreads to transaction as well.
- Authorization for destructive actions. For example, transaction cancellation to be allowed only by its owner.
- Transaction number limit to prevent ill-intended users from overbooking.
  - Imagine a single user opens 10 different transactions to overload the system. Since booked seats will be disabled when a transaction of said seats is still open, the ill-intended user can keep all these seats disabled for himself to possibly re-sell it later at a much higher price.
  - Consider having some sort of limitation and/or algorithm to prevent this from happening. Or at least make it _costly_ for bad user for attempting it (banning system, disable ticket checkout for a period of time).
- Asynchronous programming concurrency. Don't _await_ non-dependent promises consecutively. Read [this article](https://dev.to/imichaelowolabi/this-is-why-your-nodejs-application-is-slow-206j) on asynchronous performance.
- Utilize `promiseResolver` wherever you can to make it universal.
