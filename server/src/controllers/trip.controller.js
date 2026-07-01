const { tripService } = require('../services');
const { ApiResponse } = require('../utils');

class TripController {
  createTrip = async (req, res, next) => {
    try {
      const trip = await tripService.createTrip(req.body);
      res.status(201).json(new ApiResponse(201, 'Trip created successfully', trip));
    } catch (error) {
      next(error);
    }
  };

  getAllTrips = async (req, res, next) => {
    try {
      const trips = await tripService.getAllTrips();
      res.json(new ApiResponse(200, 'Trips retrieved successfully', trips));
    } catch (error) {
      next(error);
    }
  };

  deleteTrip = async (req, res, next) => {
    try {
      await tripService.deleteTrip(req.params.id);
      res.json(new ApiResponse(200, 'Trip deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  searchTrips = async (req, res, next) => {
    try {
      const { origin, destination, date } = req.query;
      
      if (!origin || !destination || !date) {
        throw new ApiError(400, 'Origin, destination, and date are required for search');
      }

      const trips = await tripService.searchTrips(origin, destination, date);
      res.json(new ApiResponse(200, 'Search results retrieved successfully', trips));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TripController();
