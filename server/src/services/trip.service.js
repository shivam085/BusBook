const { Trip, Bus } = require('../models');
const { ApiError } = require('../utils');

class TripService {
  async createTrip(tripData) {
    // Validate that the bus exists
    const bus = await Bus.findByPk(tripData.busId);
    if (!bus) {
      throw new ApiError(404, 'Associated Bus not found');
    }
    return await Trip.create(tripData);
  }

  async getAllTrips() {
    return await Trip.findAll({
      include: [{ model: Bus, as: 'bus' }]
    });
  }

  async deleteTrip(id) {
    const trip = await Trip.findByPk(id);
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }
    await trip.destroy();
    return true;
  }

  async searchTrips(origin, destination, date) {
    // 1. Fetch all trips for the specific date, including the Bus model
    const trips = await Trip.findAll({
      where: { date },
      include: [{ model: Bus, as: 'bus' }]
    });

    // 2. Filter in-memory to ensure the route is valid
    // The Bus's route array must contain both origin and destination
    // AND the origin must appear before the destination in the route.
    const validTrips = trips.filter(trip => {
      const route = trip.bus.route;
      
      // Ensure route is an array before checking
      if (!Array.isArray(route)) return false;

      const originIndex = route.findIndex(
        stop => stop.toLowerCase() === origin.toLowerCase()
      );
      const destIndex = route.findIndex(
        stop => stop.toLowerCase() === destination.toLowerCase()
      );

      // Both stops exist and origin comes before destination
      return originIndex !== -1 && destIndex !== -1 && originIndex < destIndex;
    });

    return validTrips;
  }
}

module.exports = new TripService();
