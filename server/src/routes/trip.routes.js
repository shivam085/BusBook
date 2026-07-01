const express = require('express');
const router = express.Router();
const { tripController } = require('../controllers');
const { protect, authorize } = require('../middlewares');

// Public route for searching
router.get('/search', tripController.searchTrips);

// Public route to view seat map
router.get('/:id/seats', tripController.getTripSeats);

// Admin routes
router.get('/', protect, authorize('admin'), tripController.getAllTrips);
router.post('/', protect, authorize('admin'), tripController.createTrip);
router.delete('/:id', protect, authorize('admin'), tripController.deleteTrip);

module.exports = router;
