const { adminService } = require('../services');
const { ApiResponse } = require('../utils');

class AdminController {
  getStats = async (req, res, next) => {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json(new ApiResponse(200, 'Dashboard stats retrieved successfully', stats));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminController();
