const express = require('express');
const router = express.Router();
const { busController } = require('../controllers');
const { protect, authorize } = require('../middlewares');

router.get('/', busController.getAllBuses);
router.get('/:id', busController.getBusById);

router.post('/', protect, authorize('admin'), busController.createBus);
router.put('/:id', protect, authorize('admin'), busController.updateBus);
router.delete('/:id', protect, authorize('admin'), busController.deleteBus);

module.exports = router;
