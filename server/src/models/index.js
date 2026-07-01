const User = require('./User');
const Bus = require('./Bus');
const Trip = require('./Trip');
const Booking = require('./Booking');

// A Bus can have multiple Trips scheduled
Bus.hasMany(Trip, { foreignKey: 'busId', as: 'trips' });
Trip.belongsTo(Bus, { foreignKey: 'busId', as: 'bus' });

// Bookings
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Trip.hasMany(Booking, { foreignKey: 'tripId', as: 'bookings' });
Booking.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = {
  User,
  Bus,
  Trip,
  Booking,
};
