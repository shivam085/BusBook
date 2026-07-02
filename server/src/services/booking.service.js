const { Booking, Trip, Bus } = require('../models');
const { ApiError } = require('../utils');
const paymentService = require('./payment.service');

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
    // Note: We only check against confirmed bookings. Pending bookings expire/cancel if unpaid.
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

    // 3. Create the booking with 'pending' status
    const booking = await Booking.create({
      userId,
      tripId,
      seatNumbers,
      totalAmount,
      status: 'pending' // Changed in Phase 7A
    });

    // 4. Create Razorpay order
    const order = await paymentService.createOrder(totalAmount, `receipt_booking_${booking.id}`);

    return { booking, order };
  };

  verifyBookingPayment = async (bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === 'confirmed') {
      return booking; // Already verified
    }

    // Verify signature with PaymentService
    const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      throw new ApiError(400, 'Payment signature verification failed!');
    }

    // Mark as confirmed
    booking.status = 'confirmed';
    await booking.save();

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
