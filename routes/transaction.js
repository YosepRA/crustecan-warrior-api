const express = require('express');

const controller = require('../controllers/transaction.js');
const { isLoggedIn } = require('../middlewares/index.js');

const router = express.Router();

router.use(isLoggedIn);

/* ========== Routes ========== */

router.get('/', controller.index);

router.post('/:id/cancel', controller.cancel);

module.exports = router;
