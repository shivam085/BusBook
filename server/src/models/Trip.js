const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Trip extends Model {}

Trip.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  busId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  estimatedArrivalTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Trip',
});

module.exports = Trip;
