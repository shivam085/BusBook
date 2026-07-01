const { Trip, Bus } = require('./src/models');
require('./src/config/database');

async function getRoutes() {
  try {
    const trips = await Trip.findAll({ include: [{ model: Bus, as: 'bus' }]});
    if (trips.length > 0) {
      console.log('Available Trips in DB:');
      trips.forEach(t => {
        console.log(`- Date: ${t.date} | Bus Route: ${JSON.stringify(t.bus.route)}`);
      });
    } else {
      console.log('No routes found in the database.');
    }
  } catch (e) {
    console.error('Error fetching routes:', e.message);
  } finally {
    process.exit(0);
  }
}
getRoutes();
