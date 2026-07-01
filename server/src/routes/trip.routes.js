const express = require('express');
const router = express.Router();
const { tripController } = require('../controllers');
const { protect, authorize } = require('../middlewares');

// Public route for searching
router.get('/search', tripController.searchTrips.bind(tripController));

// Admin routes
router.get('/', protect, authorize('admin'), tripController.getAllTrips.bind(tripController));
router.post('/', protect, authorize('admin'), tripController.createTrip.bind(tripController));
router.delete('/:id', protect, authorize('admin'), tripController.deleteTrip.bind(tripController));

module.exports = router;
