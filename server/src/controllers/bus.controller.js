const { busService } = require('../services');
const { ApiResponse } = require('../utils');

class BusController {
  async createBus(req, res, next) {
    try {
      const bus = await busService.createBus(req.body);
      res.status(201).json(new ApiResponse(201, 'Bus created successfully', bus));
    } catch (error) {
      next(error);
    }
  }

  async getAllBuses(req, res, next) {
    try {
      const buses = await busService.getAllBuses();
      res.json(new ApiResponse(200, 'Buses retrieved successfully', buses));
    } catch (error) {
      next(error);
    }
  }

  async getBusById(req, res, next) {
    try {
      const bus = await busService.getBusById(req.params.id);
      res.json(new ApiResponse(200, 'Bus retrieved successfully', bus));
    } catch (error) {
      next(error);
    }
  }

  async updateBus(req, res, next) {
    try {
      const bus = await busService.updateBus(req.params.id, req.body);
      res.json(new ApiResponse(200, 'Bus updated successfully', bus));
    } catch (error) {
      next(error);
    }
  }

  async deleteBus(req, res, next) {
    try {
      await busService.deleteBus(req.params.id);
      res.json(new ApiResponse(200, 'Bus deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BusController();
