const { SPOT_TYPE } = require('../constants/enums');

class ParkingSpot {
  constructor(id, type) {
    if (!Object.values(SPOT_TYPE).includes(type)) {
      throw new Error(`Invalid spot type: ${type}`);
    }

    this.id = id;
    this.type = type;
    this.occupied = false;
    this.vehicle = null;
  }

  assignVehicle(vehicle) {
    this.occupied = true;
    this.vehicle = vehicle;
  }

  removeVehicle() {
    const vehicle = this.vehicle;
    this.occupied = false;
    this.vehicle = null;
    return vehicle;
  }

  isAvailable() {
    return !this.occupied;
  }
}

module.exports = ParkingSpot;
