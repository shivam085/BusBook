const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), adminController.getStats);

module.exports = router;
