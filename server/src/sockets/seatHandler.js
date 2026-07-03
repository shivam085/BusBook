const { Booking } = require('../models');

// In-memory store for locked seats.
// Map { "tripId_seatId" -> { socketId, timestamp, timeoutId } }
const lockedSeats = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Trip Room
    socket.on('join_trip', async (tripId) => {
      // 1. Add socket to room
      socket.join(tripId);
      socket.data.tripId = tripId; // Store for disconnect handling

      try {
        // 2. Fetch all PERMANENT bookings from DB
        const bookings = await Booking.findAll({ where: { tripId, status: 'confirmed' } });
        const permanentlyBooked = [];
        bookings.forEach(b => {
          if (b.seatNumbers && Array.isArray(b.seatNumbers)) {
            permanentlyBooked.push(...b.seatNumbers);
          }
        });

        // 3. Find TEMPORARY locks from other users
        const currentlyLocked = [];
        for (const [key, value] of lockedSeats.entries()) {
          const [lockedTripId, seatId] = key.split('_');
          if (lockedTripId === tripId.toString()) {
            currentlyLocked.push(Number(seatId));
          }
        }

        // 4. Send both lists to the new user
        socket.emit('initial_locked_seats', [
          ...permanentlyBooked,
          ...currentlyLocked
        ]);
      } catch (error) {
        console.error('Error in join_trip:', error);
      }
    });

    // Lock Seat
    socket.on('lock_seat', ({ tripId, seatId }) => {
      const lockKey = `${tripId}_${seatId}`;

      // 1. Check if already locked
      if (!lockedSeats.has(lockKey)) {
        // 2. Lock it
        const lockData = {
          socketId: socket.id,
          timestamp: Date.now(),
          timeoutId: null
        };

        lockedSeats.set(lockKey, lockData);

        // Auto-unlock after 15 minutes (900000 ms)
        const timeoutId = setTimeout(() => {
          if (lockedSeats.has(lockKey)) {
            lockedSeats.delete(lockKey);
            io.to(tripId).emit('seat_updated', {
              seatId,
              status: 'available'
            });
          }
        }, 15 * 60 * 1000);

        lockData.timeoutId = timeoutId;

        // 3. Broadcast to everyone in room EXCEPT sender
        socket.to(tripId).emit('seat_updated', {
          seatId,
          status: 'locked'
        });
      }
    });

    // Unlock Seat
    socket.on('unlock_seat', ({ tripId, seatId }) => {
      const lockKey = `${tripId}_${seatId}`;
      const lockData = lockedSeats.get(lockKey);

      // Verify ownership
      if (lockData && lockData.socketId === socket.id) {
        clearTimeout(lockData.timeoutId);
        lockedSeats.delete(lockKey);

        socket.to(tripId).emit('seat_updated', {
          seatId,
          status: 'available'
        });
      }
    });

    // Disconnect Handling
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Find all locked seats belonging to this user
      for (const [key, value] of lockedSeats.entries()) {
        if (value.socketId === socket.id) {
          clearTimeout(value.timeoutId);
          lockedSeats.delete(key);

          const [tripId, seatIdStr] = key.split('_');
          
          io.to(tripId).emit('seat_updated', {
            seatId: Number(seatIdStr),
            status: 'available'
          });
        }
      }
    });
  });
};
