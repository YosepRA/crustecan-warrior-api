const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Fixture = require('../database/models/fixture.js');
const Transaction = require('../database/models/transaction.js');
const Ticket = require('../database/models/ticket.js');

const { ORIGIN, STRIPE_WEBHOOK_SECRET } = process.env;

const endpointSecret = STRIPE_WEBHOOK_SECRET;

/* ========== Helper FUnctions ========== */

async function disableSeats(fixtureId, orders) {
  const fixture = await Fixture.findById(fixtureId);
  const { seats } = fixture;

  const orderedSeats = seats.filter((seat) =>
    orders.find(
      (order) =>
        order.section === seat.section && order.seatNumber === seat.seatNumber,
    ),
  );

  orderedSeats.forEach((seat) => {
    seat.isAvailable = false;
  });

  await fixture.save();
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

  // Session automatic expiration in seconds. Default to fifteen (15) minutes.
  // const expiresAt = Math.ceil(Date.now() / 1000 + 10);

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${ORIGIN}/success`,
    cancel_url: `${ORIGIN}/cancel`,
  });

  return session;
}

async function createTransaction(fixtureId, orders, stripeSession, user) {
  const transaction = {
    fixture: fixtureId,
    orders,
    stripeSessionId: stripeSession.id,
    user,
  };

  await Transaction.create(transaction);
}

async function fulfillOrder(session) {
  const { id } = session;

  // Transaction document will be the base of orders fulfillment.
  const transaction = await Transaction.findOne({
    stripeSessionId: id,
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
}

/* ========== Exports ========== */

module.exports = {
  async createCheckoutSession(req, res) {
    const {
      body: { fixtureId, orders },
      user,
    } = req;

    /*
      1. Disable ordered seat(s) for the chosen fisture.
      2. Create a Stripe session.
      3. Create a transaction log.
      4. Return session URL.
    */

    await disableSeats(fixtureId, orders);

    const session = await createStripeSession(orders);

    await createTransaction(fixtureId, orders, session, user);

    res.json({ url: session.url });
  },
  async stripeWebhook(req, res) {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await fulfillOrder(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;

        console.log('Checkout expired');
        console.log('Session:', session);
        break;
      }

      default:
        break;
    }

    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
  },
};
