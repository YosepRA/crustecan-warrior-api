const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Fixture = require('../../database/models/fixture.js');
const Transaction = require('../../database/models/transaction.js');
const Ticket = require('../../database/models/ticket.js');

const { UI_ORIGIN } = process.env;

async function toggleSeats(fixtureId, orders, status) {
  const fixture = await Fixture.findById(fixtureId);
  const { seats } = fixture;

  const orderedSeats = seats.filter((seat) =>
    orders.find(
      (order) =>
        order.section === seat.section && order.seatNumber === seat.seatNumber,
    ),
  );

  orderedSeats.forEach((seat) => {
    seat.isAvailable = status;
  });

  await fixture.save();
}

/* Routine fixture's ticket availability check. Given fixture's ID and desired
status, it will toggle fixture's ticket availability to either true or false
when necessary. */
async function checkTicketAvailability(fixtureId, toggleTo) {
  const fixture = await Fixture.findById(fixtureId);
  const { seats } = fixture;

  /* If we're disabling seats (therefore making an order), check if there is still
  any seat available for the chosen fixture. If there isn't, then toggle fixture's
  ticket availability to false. */
  if (!toggleTo && !seats.some((seat) => seat.isAvailable)) {
    fixture.isTicketAvailable = false;

    await fixture.save();
  } else if (toggleTo) {
    /* Else if the order expires, whether through Stripe timer or explicit cancel
    button, re-enable ticket's availablity anyway since at this point, the seats
    have been toggled back on by "toggleSeats" function. */
    fixture.isTicketAvailable = true;

    await fixture.save();
  }
}

async function createStripeSession(orders) {
  /* Created and managed through Stripe dashboard. We won't be creating new items
  on the fly. */
  const priceIds = {
    A: 'price_1K1qYUAq035qnGjsVleilLbG',
    B: 'price_1K1qYkAq035qnGjsEjmCpxLQ',
    C: 'price_1K1qYvAq035qnGjs1FfQ166Z',
    D: 'price_1K1qZ8Aq035qnGjsf1Erfr6X',
  };

  /*
    1. Gather same section seats quantity.
    2. Add Stripe price ID based on seat's section.
  */
  const lineItems = orders
    .reduce((acc, { section }) => {
      const sectionCollector = acc.find((item) => item.section === section);

      if (sectionCollector === undefined) {
        return acc.concat({ section, quantity: 1 });
      }

      sectionCollector.quantity += 1;

      return acc;
    }, [])
    .map((item) => ({
      price: priceIds[item.section],
      quantity: item.quantity,
    }));

  // Session automatic expiration in seconds. Default to one hour.
  const expiresAt = Math.ceil(Date.now() / 1000 + 60 * 60);

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    expires_at: expiresAt,
    mode: 'payment',
    success_url: `${UI_ORIGIN}/ticket/checkout/result?success=true`,
    cancel_url: `${UI_ORIGIN}/ticket/checkout/result?success=false`,
  });

  return session;
}

async function createTransaction(fixtureId, orders, stripeSession, user) {
  const newTransaction = {
    fixture: fixtureId,
    orders,
    stripeSessionId: stripeSession.id,
    stripeSessionUrl: stripeSession.url,
    user,
    status: 'open',
  };

  const transaction = await Transaction.create(newTransaction);

  user.transactions.push(transaction);

  await user.save();
}

async function fulfillOrder(sessionId) {
  const transaction = await Transaction.findOne({
    stripeSessionId: sessionId,
  }).populate('user');

  // Create ticket documents based on orders array.
  const newTickets = transaction.orders.map((order) => ({
    fixture: transaction.fixture,
    seat: {
      section: order.section,
      seatNumber: order.seatNumber,
    },
  }));

  const createdTickets = await Ticket.create(newTickets);

  // Add tickets to user's tickets array.
  createdTickets.forEach((ticket) => {
    transaction.user.tickets.push(ticket);
  });

  await transaction.user.save();

  // Change transaction status to "complete".
  transaction.status = 'complete';

  await transaction.save();
}

async function cancelOrder(sessionId) {
  /*
    1. Change transaction status to "cancelled".
    2. Re-enable ordered seats and ticket's availability.
  */

  /* Straight up update its status. But we still need the orders array to
  re-enable seats. */
  const { fixture: fixtureId, orders } = await Transaction.findOneAndUpdate(
    {
      stripeSessionId: sessionId,
    },
    {
      status: 'cancelled',
    },
  );

  const toggleSeatsPromise = toggleSeats(fixtureId, orders, true);

  const checkTicketAvailabilityPromise = checkTicketAvailability(
    fixtureId,
    true,
  );

  await Promise.all([toggleSeatsPromise, checkTicketAvailabilityPromise]);
}

module.exports = {
  toggleSeats,
  checkTicketAvailability,
  createStripeSession,
  createTransaction,
  fulfillOrder,
  cancelOrder,
};
