const { Bus } = require('../models');
const { ApiError } = require('../utils');

class BusService {
  async createBus(busData) {
    const existingBus = await Bus.findOne({ where: { busNumber: busData.busNumber } });
    if (existingBus) {
      throw new ApiError(400, 'Bus with this number already exists');
    }
    return await Bus.create(busData);
  }

  async getAllBuses() {
    return await Bus.findAll();
  }

  async getBusById(id) {
    const bus = await Bus.findByPk(id);
    if (!bus) {
      throw new ApiError(404, 'Bus not found');
    }
    return bus;
  }

  async updateBus(id, busData) {
    const bus = await this.getBusById(id);
    return await bus.update(busData);
  }

  async deleteBus(id) {
    const bus = await this.getBusById(id);
    await bus.destroy();
    return true;
  }
}

module.exports = new BusService();
