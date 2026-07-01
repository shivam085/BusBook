const express = require('express');
const router = express.Router();
const { bookingController } = require('../controllers');
const { protect } = require('../middlewares');

// All booking routes require authentication
router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);

module.exports = router;
