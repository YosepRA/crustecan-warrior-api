const express = require('express');

const controller = require('../controllers/fixture.js');

const router = express.Router();

/* ========== Routes ========== */

router.get('/', controller.index);

router.get('/:id', controller.show);

module.exports = router;
