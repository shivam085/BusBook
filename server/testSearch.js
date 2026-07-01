const { Bus, Trip } = require('./src/models');
const tripService = require('./src/services/trip.service');
require('./src/config/database');

async function testSearch() {
  try {
    // 1. Create a Bus
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-' + Math.floor(Math.random() * 1000),
      capacity: 40,
      type: 'AC',
      route: ['Mumbai', 'Pune', 'Bangalore']
    });
    console.log('Created Bus ID:', bus.id);

    // 2. Schedule a Trip
    const date = '2025-12-25';
    const trip = await Trip.create({
      busId: bus.id,
      date,
      departureTime: '10:00:00',
      estimatedArrivalTime: '22:00:00',
      basePrice: 1500
    });
    console.log('Created Trip ID:', trip.id);

    // 3. Search for Trip from Mumbai to Pune
    const searchResults1 = await tripService.searchTrips('Mumbai', 'Pune', date);
    console.log(`Search Mumbai -> Pune found ${searchResults1.length} trips.`);

    // 4. Search for Trip from Pune to Mumbai (Should be 0 because route order matters)
    const searchResults2 = await tripService.searchTrips('Pune', 'Mumbai', date);
    console.log(`Search Pune -> Mumbai found ${searchResults2.length} trips.`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testSearch();
