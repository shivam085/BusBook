const authService = require('./auth.service');
const busService = require('./bus.service');
const tripService = require('./trip.service');
const bookingService = require('./booking.service');
const paymentService = require('./payment.service');
const ticketService = require('./ticket.service');
const emailService = require('./email.service');

module.exports = {
  authService,
  busService,
  tripService,
  bookingService,
  paymentService,
  ticketService,
  emailService
};
