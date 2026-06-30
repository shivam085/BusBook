const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Bus extends Model {}

Bus.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  busNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('AC', 'Non-AC', 'Sleeper'),
    allowNull: false,
    defaultValue: 'Non-AC',
  },
  route: {
    // Storing route stops as a JSON array (e.g. ["Mumbai", "Pune", "Lonavala"])
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  }
}, {
  sequelize,
  modelName: 'Bus',
});

module.exports = Bus;
