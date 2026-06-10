const SpotAllocator = require('./SpotAllocator');
const { VEHICLE_TYPE, SPOT_TYPE } = require('../../constants/enums');

/**
 * Smallest fitting spot first, then bigger ones — so a motorcycle doesn't grab
 * the only large spot while a smaller one sits free.
 */
const SIZE_FALLBACK = Object.freeze({
  [VEHICLE_TYPE.MOTORCYCLE]: [SPOT_TYPE.SMALL, SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
  [VEHICLE_TYPE.CAR]: [SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
  [VEHICLE_TYPE.ELECTRIC]: [SPOT_TYPE.MEDIUM, SPOT_TYPE.LARGE],
  [VEHICLE_TYPE.BUS]: [SPOT_TYPE.LARGE],
});

/**
 * Default rule. Tries spots in this order: handicapped (if disabled), then
 * charging (if electric), then by size. Searches floors front to back.
 */
class PreferenceAllocator extends SpotAllocator {
  preferenceOrder(vehicle) {
    const prefs = [];
    if (vehicle.isDisabled) prefs.push(SPOT_TYPE.HANDICAPPED);
    if (vehicle.needsCharging) prefs.push(SPOT_TYPE.CHARGING);

    const fallback = SIZE_FALLBACK[vehicle.type];
    if (!fallback) throw new Error(`No spot-size mapping for vehicle type: ${vehicle.type}`);
    prefs.push(...fallback);

    return prefs;
  }

  findSpot(lot, vehicle) {
    const prefs = this.preferenceOrder(vehicle);
    for (const floor of lot.floors) {
      for (const type of prefs) {
        const spot = floor.getAvailableSpot(type);
        if (spot) return spot;
      }
    }
    return null;
  }
}

module.exports = PreferenceAllocator;
