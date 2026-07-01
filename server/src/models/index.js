const User = require('./User');
const Bus = require('./Bus');
const Trip = require('./Trip');

// Associations
Bus.hasMany(Trip, { foreignKey: 'busId', as: 'trips' });
Trip.belongsTo(Bus, { foreignKey: 'busId', as: 'bus' });

module.exports = {
  User,
  Bus,
  Trip,
};
