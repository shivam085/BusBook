const express = require('express');
const router = express.Router();
const { busController } = require('../controllers');
const { protect, authorize } = require('../middlewares');

router.get('/', busController.getAllBuses.bind(busController));
router.get('/:id', busController.getBusById.bind(busController));

router.post('/', protect, authorize('admin'), busController.createBus.bind(busController));
router.put('/:id', protect, authorize('admin'), busController.updateBus.bind(busController));
router.delete('/:id', protect, authorize('admin'), busController.deleteBus.bind(busController));

module.exports = router;
