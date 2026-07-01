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

  searchTrips = async (origin, destination, date) => {
    // 1. Fetch all trips for the specific date, including the Bus model
    const trips = await Trip.findAll({
      where: { date },
      include: [{ model: Bus, as: 'bus' }]
    });

    // 2. Filter trips in-memory based on the Bus's route array
    const validTrips = trips.filter(trip => {
      const route = trip.bus.route || [];
      const originIndex = route.findIndex(stop => stop.toLowerCase() === origin.toLowerCase());
      const destIndex = route.findIndex(stop => stop.toLowerCase() === destination.toLowerCase());

      // Valid if both exist AND origin comes before destination
      return originIndex !== -1 && destIndex !== -1 && originIndex < destIndex;
    });

    return validTrips;
  };

  getTripSeats = async (tripId) => {
    const { Booking } = require('../models');

    // Fetch the trip along with the bus (for capacity)
    const trip = await Trip.findByPk(tripId, {
      include: [{ model: Bus, as: 'bus' }]
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Fetch all confirmed bookings for this trip
    const bookings = await Booking.findAll({
      where: { 
        tripId, 
        status: 'confirmed' 
      }
    });

    // Aggregate all booked seat numbers into a flat array
    let bookedSeats = [];
    bookings.forEach(booking => {
      if (Array.isArray(booking.seatNumbers)) {
        bookedSeats.push(...booking.seatNumbers);
      }
    });

    return {
      trip,
      bookedSeats
    };
  };
}

module.exports = new TripService();
