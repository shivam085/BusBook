const express = require('express');
const router = express.Router();
const { walletController } = require('../controllers');
const { protect } = require('../middlewares');

// All wallet routes require authentication
router.use(protect);

router.post('/add-funds', walletController.addFunds);
router.post('/verify', walletController.verifyPayment);

module.exports = router;
