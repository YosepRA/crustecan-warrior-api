const express = require('express');

const controller = require('../controllers/ticket.js');
const { isLoggedIn, demo } = require('../middlewares/index.js');

const router = express.Router();

/* ========== Routes ========== */

router.get('/:ticketId', controller.show);

router.post(
  '/create-checkout-session',
  demo,
  isLoggedIn,
  express.json(),
  controller.createCheckoutSession,
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  controller.stripeWebhook,
);

module.exports = router;
