const { VEHICLE_TYPE, SPOT_TYPE } = require('../constants/enums');

class ParkingFloor {
  constructor(floorNumber, spots = []) {
    this.floorNumber = floorNumber;
    this.spots = spots; // Array of ParkingSpot
  }

  findAvailableSpot(vehicle) {
    const preferences = [];

    // Prioritize special requirements
    if (vehicle.isDisabled) preferences.push(SPOT_TYPE.HANDICAPPED);
    if (vehicle.type === VEHICLE_TYPE.ELECTRIC) preferences.push(SPOT_TYPE.CHARGING);

    // Fallback map
    const fallbackMap = {
      [VEHICLE_TYPE.MOTORCYCLE]: [SPOT_TYPE.SMALL, SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
      [VEHICLE_TYPE.CAR]: [SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
      [VEHICLE_TYPE.ELECTRIC]: [SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
      [VEHICLE_TYPE.BUS]: [SPOT_TYPE.LARGE],
    };

    preferences.push(...fallbackMap[vehicle.type]);

    for (const type of preferences) {
      const spot = this.spots.find(s => s.type === type && s.isAvailable());
      if (spot) return spot;
    }

    return null;
  }
}

module.exports = ParkingFloor;
