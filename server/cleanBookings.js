const { Booking } = require('./src/models');
require('./src/config/database');

async function clean() {
  try {
    await Booking.destroy({ where: {} });
    console.log('Cleared all previous bookings for clean test run.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
clean();
