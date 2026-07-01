const { Booking, Trip, Bus } = require('../models');
const { ApiError } = require('../utils');

class BookingService {
  createBooking = async (userId, tripId, seatNumbers, totalAmount) => {
    // 1. Verify Trip exists
    const trip = await Trip.findByPk(tripId, {
      include: [{ model: Bus, as: 'bus' }]
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // 2. Double check availability in real time to prevent race conditions
    const existingBookings = await Booking.findAll({
      where: { 
        tripId, 
        status: 'confirmed' 
      }
    });

    let alreadyBooked = [];
    existingBookings.forEach(booking => {
      if (Array.isArray(booking.seatNumbers)) {
        alreadyBooked.push(...booking.seatNumbers);
      }
    });

    // Check if any of the requested seats are already booked
    const conflict = seatNumbers.find(seat => alreadyBooked.includes(seat));
    if (conflict) {
      throw new ApiError(409, `Seat ${conflict} is already booked! Please select another seat.`);
    }

    // 3. Create the booking
    const booking = await Booking.create({
      userId,
      tripId,
      seatNumbers,
      totalAmount,
      status: 'confirmed' // For Phase 6. In Phase 7 this will be 'pending' until Razorpay success
    });

    return booking;
  };

  getUserBookings = async (userId) => {
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [{ model: Bus, as: 'bus' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return bookings;
  };
}

module.exports = new BookingService();
