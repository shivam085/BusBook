const express = require('express');
const authRoutes = require('./auth.routes');
const busRoutes = require('./bus.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busRoutes);

module.exports = router;
