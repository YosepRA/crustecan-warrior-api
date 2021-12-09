const express = require('express');

const controller = require('../controllers/user.js');
const { authenticateLogin, isLoggedIn } = require('../middlewares/index.js');

const router = express.Router();

/* ========== Middlewares ========== */

router.use(express.json());

/* ========== Routes ========== */

router.post('/register', controller.register);

router.post('/login', authenticateLogin, controller.login);

router.get('/logout', controller.logout);

router.get('/protected', isLoggedIn, (req, res) => {
  res.send('You have entered the protected route.');
});

module.exports = router;
