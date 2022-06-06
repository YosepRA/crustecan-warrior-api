const express = require('express');

const controller = require('../controllers/user.js');
const {
  authenticateLogin,
  isLoggedIn,
  demo,
} = require('../middlewares/index.js');

const router = express.Router();

/* ========== Middlewares ========== */

router.use(express.json());

/* ========== Routes ========== */

router.post('/register', demo, controller.register);

router.post('/login', authenticateLogin, controller.login);

router.get('/login-session', isLoggedIn, controller.getLoginSession);

router.get('/logout', controller.logout);

router.get('/ticket', isLoggedIn, controller.ticketList);

router.get('/transaction', isLoggedIn, controller.transactionList);

router.put('/transaction/:id/cancel', isLoggedIn, controller.transactionCancel);

module.exports = router;
