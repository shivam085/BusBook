const { bookingService } = require('../services');
const { ApiResponse } = require('../utils');

class BookingController {
  createBooking = async (req, res, next) => {
    try {
      const { tripId, seatNumbers, totalAmount } = req.body;
      const userId = req.user.id;

      const result = await bookingService.createBooking(userId, tripId, seatNumbers, totalAmount);
      res.status(201).json(new ApiResponse(201, 'Booking pending payment', result));
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getUserBookings(userId);
      res.json(new ApiResponse(200, 'Bookings retrieved successfully', bookings));
    } catch (error) {
      next(error);
    }
  };

  verifyPayment = async (req, res, next) => {
    try {
      const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const confirmedBooking = await bookingService.verifyBookingPayment(
        bookingId, 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      );
      
      res.json(new ApiResponse(200, 'Payment verified successfully', confirmedBooking));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BookingController();
