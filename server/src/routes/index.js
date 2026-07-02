const express = require('express');
const authRoutes = require('./auth.routes');
const busRoutes = require('./bus.routes');
const tripRoutes = require('./trip.routes');
const bookingRoutes = require('./booking.routes');
const walletRoutes = require('./wallet.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busRoutes);
router.use('/trips', tripRoutes);
router.use('/bookings', bookingRoutes);
router.use('/wallet', walletRoutes);

module.exports = router;
