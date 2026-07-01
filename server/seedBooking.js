const { Booking, Trip, User } = require('./src/models');
require('./src/config/database');

async function seedBookings() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@bus.com' } });
    const trip = await Trip.findOne();
    
    if (admin && trip) {
      await Booking.create({
        userId: admin.id,
        tripId: trip.id,
        seatNumbers: [1, 2, 3], // Reserve first 3 seats
        status: 'confirmed',
        totalAmount: trip.basePrice * 3
      });
      console.log('Test booking seeded successfully: Seats 1, 2, 3 reserved.');
    } else {
      console.log('Could not find admin or trip to attach booking to.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seedBookings();
