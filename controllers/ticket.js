const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Ticket = require('../database/models/ticket.js');
const checkout = require('./helpers/checkout-functions.js');
const { promiseResolver } = require('../scripts/helpers.js');

const { STRIPE_WEBHOOK_SECRET: endpointSecret } = process.env;

module.exports = {
  async show(req, res) {
    const {
      params: { ticketId },
    } = req;

    const [data, error] = await promiseResolver(
      Ticket.findById(ticketId).populate('fixture'),
    );

    if (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      data,
    });
  },
  async createCheckoutSession(req, res) {
    const {
      body: { fixtureId, orders },
      user,
    } = req;

    /*
      1. Disable ordered seat(s) for the chosen fixture.
      2. Ticket availablity routine check.
      3. Create a Stripe session.
      4. Create a transaction log.
      5. Return session URL.
    */

    await checkout.toggleSeats(fixtureId, orders, false);

    await checkout.checkTicketAvailability(fixtureId, false);

    const session = await checkout.createStripeSession(orders);

    await checkout.createTransaction(fixtureId, orders, session, user);

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

        await checkout.fulfillOrder(session.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;

        await checkout.cancelOrder(session.id);
        break;
      }

      default:
        break;
    }

    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
  },
};
