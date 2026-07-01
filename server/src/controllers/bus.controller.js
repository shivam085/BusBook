const { busService } = require('../services');
const { ApiResponse } = require('../utils');

class BusController {
  createBus = async (req, res, next) => {
    try {
      const bus = await busService.createBus(req.body);
      res.status(201).json(new ApiResponse(201, 'Bus created successfully', bus));
    } catch (error) {
      next(error);
    }
  };

  getAllBuses = async (req, res, next) => {
    try {
      const buses = await busService.getAllBuses();
      res.json(new ApiResponse(200, 'Buses retrieved successfully', buses));
    } catch (error) {
      next(error);
    }
  };

  getBusById = async (req, res, next) => {
    try {
      const bus = await busService.getBusById(req.params.id);
      res.json(new ApiResponse(200, 'Bus retrieved successfully', bus));
    } catch (error) {
      next(error);
    }
  };

  updateBus = async (req, res, next) => {
    try {
      const bus = await busService.updateBus(req.params.id, req.body);
      res.json(new ApiResponse(200, 'Bus updated successfully', bus));
    } catch (error) {
      next(error);
    }
  };

  deleteBus = async (req, res, next) => {
    try {
      await busService.deleteBus(req.params.id);
      res.json(new ApiResponse(200, 'Bus deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BusController();
