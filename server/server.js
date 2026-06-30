require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config');

// Import models to ensure they are registered with Sequelize
require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // In a real production app you wouldn't use force or alter typically, 
    // you would use migrations. For this phase, alter is fine.
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
