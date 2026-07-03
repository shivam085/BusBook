const authService = require('./auth.service');
const adminService = require('./admin.service');
const busService = require('./bus.service');
const tripService = require('./trip.service');
const bookingService = require('./booking.service');
const paymentService = require('./payment.service');
const emailService = require('./email.service');
const ticketService = require('./ticket.service');
const walletService = require('./wallet.service');

module.exports = {
  authService,
  busService,
  tripService,
  bookingService,
  paymentService,
  emailService,
  ticketService,
  walletService,
  adminService
};
