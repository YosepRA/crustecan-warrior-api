const express = require('express');

const controller = require('../controllers/ticket.js');
const { isLoggedIn } = require('../middlewares/index.js');

const router = express.Router();

/* ========== Routes ========== */

router.post(
  '/create-checkout-session',
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
