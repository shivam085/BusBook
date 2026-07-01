const express = require('express');
const router = express.Router();
const { tripController } = require('../controllers');
const { protect, authorize } = require('../middlewares');

// Public route for searching
router.get('/search', tripController.searchTrips);

// Admin routes
router.get('/', protect, authorize('admin'), tripController.getAllTrips);
router.post('/', protect, authorize('admin'), tripController.createTrip);
router.delete('/:id', protect, authorize('admin'), tripController.deleteTrip);

module.exports = router;
