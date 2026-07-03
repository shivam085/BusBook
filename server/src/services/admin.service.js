const { User, Booking } = require('../models');

class AdminService {
  async getDashboardStats() {
    // Total users
    const totalUsers = await User.count({ where: { role: 'user' } });

    // Total confirmed bookings
    const totalBookings = await Booking.count({ where: { status: 'confirmed' } });

    // Total revenue from confirmed bookings
    const totalRevenue = await Booking.sum('totalAmount', { where: { status: 'confirmed' } });

    return {
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue || 0
    };
  }
}

module.exports = new AdminService();
