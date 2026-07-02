const { Booking, Trip, Bus, User } = require('../models');
const { ApiError } = require('../utils');
const paymentService = require('./payment.service');
const ticketService = require('./ticket.service');
const emailService = require('./email.service');

class BookingService {
  createBooking = async (userId, tripId, seatNumbers, totalAmount, paymentMethod = 'razorpay') => {
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

    if (paymentMethod === 'wallet') {
      const user = await User.findByPk(userId);
      if (user.walletBalance < totalAmount) {
        throw new ApiError(400, 'Insufficient wallet balance');
      }

      // Deduct balance
      user.walletBalance -= totalAmount;
      await user.save();

      // Create confirmed booking
      const booking = await Booking.create({
        userId,
        tripId,
        seatNumbers,
        totalAmount,
        status: 'confirmed'
      });

      // Refetch booking with related data for ticket generation
      const confirmedBooking = await Booking.findByPk(booking.id, {
        include: [
          { model: Trip, as: 'trip', include: [{ model: Bus, as: 'bus' }] },
          { model: User, as: 'user' }
        ]
      });

      // Generate PDF and Send Email asynchronously
      ticketService.generateTicketPDF(confirmedBooking, confirmedBooking.user)
        .then(pdfBuffer => {
          const mailgenContent = emailService.ticketConfirmationMailgenContent(confirmedBooking.user.name);
          return emailService.sendEmail({
            email: confirmedBooking.user.email,
            subject: 'Your Bus Ticket Confirmation - BusBook (Paid via Wallet)',
            mailgenContent: mailgenContent,
            attachments: [{
              filename: `Ticket-${confirmedBooking.id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }]
          });
        }).catch(err => console.error('Failed to generate or send ticket:', err));

      return { booking: confirmedBooking, order: null, paidViaWallet: true, newWalletBalance: user.walletBalance };
    }

    // 3. Create the booking with 'pending' status (for Razorpay)
    const booking = await Booking.create({
      userId,
      tripId,
      seatNumbers,
      totalAmount,
      status: 'pending' // Changed in Phase 7A
    });

    // 4. Create Razorpay order
    const order = await paymentService.createOrder(totalAmount, `receipt_booking_${booking.id}`);

    return { booking, order, paidViaWallet: false };
  };

  verifyBookingPayment = async (bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [{ model: Bus, as: 'bus' }]
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });
    
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

    // Generate PDF and Send Email (Asynchronously)
    ticketService.generateTicketPDF(booking, booking.user)
      .then(pdfBuffer => {
        const mailgenContent = emailService.ticketConfirmationMailgenContent(booking.user.name);
        
        return emailService.sendEmail({
          email: booking.user.email,
          subject: 'Your Bus Ticket Confirmation - BusBook',
          mailgenContent: mailgenContent,
          attachments: [
            {
              filename: `Ticket-${booking.id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }
          ]
        });
      })
      .catch(err => console.error('Failed to generate or send ticket:', err));

    return booking;
  };

  getTicketPDF = async (userId, bookingId) => {
    const booking = await Booking.findOne({
      where: { id: bookingId, userId, status: 'confirmed' },
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [{ model: Bus, as: 'bus' }]
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Confirmed booking not found');
    }

    const pdfBuffer = await ticketService.generateTicketPDF(booking, booking.user);
    return pdfBuffer;
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
