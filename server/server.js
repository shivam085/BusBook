require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { sequelize } = require('./src/config');

// Import models to ensure they are registered with Sequelize
require('./src/models');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Setup sockets
const setupSockets = require('./src/sockets/seatHandler');
setupSockets(io);

// Make io accessible globally via app if needed
app.set('io', io);

const startServer = async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // In a real production app you wouldn't use force or alter typically, 
    // you would use migrations. For this phase, alter is fine.
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
